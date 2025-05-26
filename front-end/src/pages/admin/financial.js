import { useState, useEffect, useRef } from 'react';
import * as react from '@phosphor-icons/react';
import useAuth from '../../hooks/useAuth';
import Header from '../../components/header-admin';
import Footer from '../../components/footer-admin';
import Modal from 'react-modal';
import CustomField from '../../components/custom-field';
import CustomButton from '../../components/custom-buttom';
import CustomDropdown from '../../components/custom-dropdown';
import Banner from '../../components/banner';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';


ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function validateTransactionFields(fields, setInvalidFlags, showBannerMessage) {
  const requiredFields = ['title', 'value', 'date', 'relates_to'];
  const flags = requiredFields.reduce((acc, field) => {
    acc[`is${field.charAt(0).toUpperCase() + field.slice(1)}Invalid`] = !fields[field];
    return acc;
  }, {});

  setInvalidFlags(flags);

  const hasInvalid = Object.values(flags).some(Boolean);
  if (hasInvalid) {
    showBannerMessage('Preencha todos os campos obrigatórios!', 'error');
    return false;
  }
  return true;
}

function formatTransactionValue(value) {
  return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
}

function createNewTransaction({ title, value, date, relates_to, note, transactionType, user }) {
  return {
    title,
    value: formatTransactionValue(value),
    date,
    relates_to,
    note,
    type: transactionType,
    user_id: user?.id,
  };
}

function updateTransactionTotals(transactions, setTotalAmount, setTotalIncomes, setTotalExpenses) {
  const total = transactions.reduce((acc, t) => {
    const val = parseFloat(t.value);
    return t.type === 'receita' ? acc + val : acc - val;
  }, 0);
  setTotalAmount(total);

  const incomes = transactions.filter(t => t.type === 'receita').reduce((acc, t) => acc + parseFloat(t.value), 0);
  const expenses = transactions.filter(t => t.type === 'despesa').reduce((acc, t) => acc + parseFloat(t.value), 0);

  setTotalIncomes(incomes);
  setTotalExpenses(expenses);
}

function FinancialPage() {
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const user = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [relates_to, setrelates_to] = useState('');
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalIncomes, setTotalIncomes] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod] = useState('last6months');
  const [chartData, setChartData] = useState({ incomes: [], expenses: [], labels: [] });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedFilterColumn, setSelectedFilterColumn] = useState(null);
  const [isTitleInvalid, setIsTitleInvalid] = useState(false);
  const [isValueInvalid, setIsValueInvalid] = useState(false);
  const [isDateInvalid, setIsDateInvalid] = useState(false);
  const [isRelatesToInvalid, setIsRelatesToInvalid] = useState(false);
  const [isFilterApplied, setIsFilterApplied] = useState({ tipo: false, valor: false, data: false, relates_to: false, user: false });
  const [filterValues, setFilterValues] = useState({});
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedFilter] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterPosition] = useState({ top: 0, left: 0 });
  const [filterMenuOptions, setFilterMenuOptions] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const filterMenuRef = useRef(null);

  const filterButtonRefs = useRef({
    tipo: null,
    valor: null,
    data: null,
    relates_to: null,
    user: null,
  });

  const isDateInRange = (date, range) => {
    const d = new Date(date);
    const now = new Date();

    if (range === 'Últimos 6 meses') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      return d >= sixMonthsAgo && d <= now;
    }
    if (range === 'Últimos 3 anos') {
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(now.getFullYear() - 3);
      return d >= threeYearsAgo && d <= now;
    }
    return true;
  };

  function filterByTipo(transaction, tipo) {
    if (!tipo) return true;
    return transaction.type === (tipo === 'Entrada' ? 'receita' : 'despesa');
  }

  function filterByRelatesTo(transaction, relates_to) {
    if (!relates_to) return true;
    return transaction.relates_to === relates_to;
  }

  function filterByData(transaction, data) {
    if (!data) return true;
    return isDateInRange(transaction.date, data);
  }

  function filterByUser(transaction, user) {
    if (!user) return true;
    return transaction.user_name === user;
  }

  const applySingleFilter = (transaction, filters) => {
    return (
      filterByTipo(transaction, filters.tipo) &&
      filterByRelatesTo(transaction, filters.relates_to) &&
      filterByData(transaction, filters.data) &&
      filterByUser(transaction, filters.user)
    );
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/financial/transactions`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        console.log(data);

        if (response.ok) {
          setTransactions(data);
          setFilteredTransactions(data);

          const total = data.reduce((acc, t) => {
            const val = parseFloat(t.value);
            return t.type === 'receita' ? acc + val : acc - val;
          }, 0);
          setTotalAmount(total);

          const incomes = data.filter(t => t.type === 'receita').reduce((acc, t) => acc + parseFloat(t.value), 0);
          const expenses = data.filter(t => t.type === 'despesa').reduce((acc, t) => acc + parseFloat(t.value), 0);

          setTotalIncomes(incomes);
          setTotalExpenses(expenses);
        } else {
          console.error('Erro ao buscar transações');
        }
      } catch (error) {
        console.error('Erro ao buscar transações:', error);
      }
    };
    fetchTransactions();
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const groupByMonth = () => {
      const monthMap = {};

      const currentDate = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(currentDate.getMonth() - 6);

      transactions.forEach(t => {
        const transactionDate = new Date(t.date);

        if (transactionDate >= sixMonthsAgo) {
          const month = `${(transactionDate.getMonth() + 1).toString().padStart(2, '0')}/${transactionDate.getFullYear()}`;
          if (!monthMap[month]) {
            monthMap[month] = { receita: 0, despesa: 0 };
          }
          monthMap[month][t.type] += parseFloat(t.value);
        }
      });

      const labels = Object.keys(monthMap)
        .sort((a, b) => new Date(a.split('/').reverse().join('/')) - new Date(b.split('/').reverse().join('/')))
        .slice(0, 6);

      const incomes = labels.map(label => monthMap[label].receita || 0);
      const expenses = labels.map(label => monthMap[label].despesa || 0);

      setChartData({ labels, incomes, expenses });
    };

    groupByMonth();
  }, [transactions, selectedPeriod]);

  const toggleFilter = (column) => {
    if (isFilterApplied[column]) {
      clearFilters();
      return;
    }

    setSelectedFilterColumn(column);
    setIsFilterModalOpen(true);

    switch (column) {
      case 'tipo':
        setFilterMenuOptions(["Entrada", "Saída"]);
        break;
      case 'valor':
        setFilterMenuOptions(["Maior valor", "Menor valor"]);
        break;
      case 'data':
        setFilterMenuOptions(["Últimos 6 meses", "Últimos 3 anos"]);
        break;
      case 'relates_to':
        setFilterMenuOptions(["Eventos", "Produtos", "Jogos", "Outros"]);
        break;
      case 'user': {
        const userNames = transactions.map(t => t.user_name).filter((v, i, a) => a.indexOf(v) === i);
        setFilterMenuOptions(userNames);
        break;
      }
      default:
        setFilterMenuOptions([]);
    }
  };
  const applyFilter = (filterValue) => {
    setShowFilterMenu(false);
    const newFilterValues = { ...filterValues, [selectedFilterColumn]: filterValue };
    setFilterValues(newFilterValues);
    setIsFilterApplied(prev => ({ ...prev, [selectedFilterColumn]: true }));

    const filtered = transactions.filter(t => applySingleFilter(t, newFilterValues));

    setFilteredTransactions(filtered);
  };

  const clearFilters = (column) => {
    const updatedFilterValues = { ...filterValues };
    delete updatedFilterValues[column];
    setFilterValues(updatedFilterValues);
    setIsFilterApplied(prev => ({ ...prev, [column]: false }));

    const newFiltered = transactions.filter(t => applySingleFilter(t, updatedFilterValues));

    setFilteredTransactions(Object.keys(updatedFilterValues).length === 0 ? transactions : newFiltered);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransactionId(transaction.id);
    setTitle(transaction.title);
    setValue(Number(transaction.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    setDate(transaction.date.split('T')[0]);
    setrelates_to(transaction.relates_to);
    setNote(transaction.note || '');
    setTransactionType(transaction.type);
    setIsModalOpen(true);
  };



  const handleDeleteTransaction = (transaction) => {
    setTransactionToDelete(transaction);
  };

  const showBannerMessage = (message, type, description = '') => {
    setBannerMessage(message);
    setBannerDescription(description);
    setBannerType(type);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 4500);
  };

  const openModal = (type) => {
    setTransactionType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTitle('');
    setValue('');
    setDate('');
    setrelates_to('');
    setNote('');
    setTransactionType(null);
    setEditingTransactionId(null);
  };

  const handleRegisterTransaction = async () => {
    const isValid = validateTransactionFields(
      { title, value, date, relates_to },
      ({ isTitleInvalid, isValueInvalid, isDateInvalid, isRelatesToInvalid }) => {
        setIsTitleInvalid(isTitleInvalid);
        setIsValueInvalid(isValueInvalid);
        setIsDateInvalid(isDateInvalid);
        setIsRelatesToInvalid(isRelatesToInvalid);
      },
      showBannerMessage
    );

    if (!isValid) return;

    setIsLoading(true);

    const newTransaction = createNewTransaction({ title, value, date, relates_to, note, transactionType, user });

    try {
      const url = editingTransactionId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/financial/transaction/${editingTransactionId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/financial/transaction`;
      const method = editingTransactionId ? 'PUT' : 'POST';

      const token = localStorage.getItem('token');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTransaction),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedTransaction = { ...data, user_name: user.name };

        const updatedTransactions = editingTransactionId
          ? transactions.map((t) => t.id === editingTransactionId ? updatedTransaction : t)
          : [...transactions, updatedTransaction];

        setTransactions(updatedTransactions);
        setFilteredTransactions(updatedTransactions);

        updateTransactionTotals(updatedTransactions, setTotalAmount, setTotalIncomes, setTotalExpenses);

        showBannerMessage('Transação registrada com sucesso!', 'success');
        closeModal();
      } else {
        showBannerMessage('Erro ao registrar transação', 'error', 'Verifique os campos preenchidos ou tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao registrar transação:', error);
      showBannerMessage('Erro de conexão', 'error', 'Não foi possível se conectar ao servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/financial/transaction/${transactionToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== transactionToDelete.id));
        showBannerMessage("Transação excluída com sucesso!", "error");
      } else {
        showBannerMessage("Erro ao excluir", "error", "Tente novamente mais tarde.");
      }
    } catch (error) {
      console.error(error);
      showBannerMessage("Erro de conexão", "error", "Não foi possível excluir a transação.");
    } finally {
      setTransactionToDelete(null);
      setIsDeleting(false);
    }
  };

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (isFilterApplied.valor) {
      const valueA = parseFloat(a.value);
      const valueB = parseFloat(b.value);
      return filterValues.valor === 'Maior valor' ? valueB - valueA : valueA - valueB;
    }
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="financial-page flex flex-col min-h-screen bg-white text-black dark:bg-[#0e1117] dark:text-white transition-colors duration-500 ease-in-out">
      <Header />

      {showBanner && (
        <Banner
          message={bannerMessage}
          description={bannerDescription}
          type={bannerType}
          className="absolute top-0 left-0 right-0 z-[100] p-4 bg-red-500 text-white text-center shadow-md"
        />
      )}

      <div className="container mx-auto p-6 flex-grow">
        <h1 className="text-5xl font-bold mb-10 mt-4 text-center text-gray-800 dark:text-white">Gestão Financeira</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-white">
          <div className="m-4 bg-green-900 p-4 rounded-xl shadow-md text-center">
            <h3 className="text-md font-semibold mb-1">Total de Receita</h3>
            <p className="text-xl font-bold">{totalIncomes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <div className="bg-white dark:bg-[#0e1117] mt-3 rounded-lg p-2">
              <Bar
                data={{
                  labels: chartData.labels,
                  datasets: [{
                    label: 'Receitas',
                    data: chartData.incomes,
                    backgroundColor: '#166534',
                  }],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true },
                    tooltip: {
                      callbacks: {
                        label: (tooltipItem) => `R$ ${tooltipItem.raw.toFixed(2)}`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: { font: { family: 'Kohinoor Bangla' } },
                    },
                    y: {
                      ticks: {
                        callback: (value) => `R$ ${value.toFixed(2)}`,
                        font: { family: 'Kohinoor Bangla' },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className="bg-gray-900 dark:bg-white/10 dark:backdrop-blur-md flex flex-col justify-between p-6 rounded-xl shadow-md text-center h-auto">
            <div className="flex-grow flex flex-col justify-center items-center">
              <h3 className="text-2xl font-semibold mb-1">Total em Caixa</h3>
              <p className="text-3xl font-bold">{totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            <div className="flex justify-between gap-4 mt-auto">
              <button
                className="flex flex-col items-center justify-center gap-1 bg-green-900 hover:bg-green-700 transition-colors text-white py-3 px-6 rounded-lg shadow text-xs font-medium w-full"
                onClick={() => openModal('receita')}
              >
                <react.HandArrowDownIcon size={20} />
                Entrada
              </button>
              <button
                className="flex flex-col items-center justify-center gap-1 bg-red-900 hover:bg-red-700 transition-colors text-white py-3 px-6 rounded-lg shadow text-xs font-medium w-full"
                onClick={() => openModal('despesa')}
              >
                <react.HandArrowUpIcon size={20} />
                Saída
              </button>
            </div>
          </div>
          <div className="m-4 bg-red-900 p-4 rounded-xl shadow-md text-center">
            <h3 className="text-md font-semibold mb-1">Total de Despesas</h3>
            <p className="text-xl font-bold">{totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <div className="bg-white dark:bg-[#0e1117] mt-3 rounded-lg p-2">
              <Bar
                data={{
                  labels: chartData.labels,
                  datasets: [{
                    label: 'Despesas',
                    data: chartData.expenses,
                    backgroundColor: '#991b1b',
                  }],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (tooltipItem) => `R$ ${tooltipItem.raw.toFixed(2)}`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: { font: { family: 'Kohinoor Bangla' } },
                    },
                    y: {
                      ticks: {
                        callback: (value) => `R$ ${value.toFixed(2)}`,
                        font: { family: 'Kohinoor Bangla' },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {(() => {
          const borderClass = transactionType === 'receita'
            ? 'border-green-800 dark:border-green-600'
            : 'border-red-800 dark:border-red-600';
          const textClass = transactionType === 'receita'
            ? 'text-green-800 dark:text-green-600'
            : 'text-red-800 dark:text-red-600';
          const buttonClass = transactionType === 'receita'
            ? `!bg-green-800 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-green-700 dark:hover:!bg-green-700'}`
            : `!bg-red-800 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-red-700 dark:hover:!bg-red-700'}`;
          const buttonText = isLoading ? 'Registrando...' : 'Registrar';
          return (
            <Modal
              isOpen={isModalOpen}
              onRequestClose={closeModal}
              shouldCloseOnOverlayClick={true}
              overlayClassName="ReactModal__Overlay fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300"
              className={`relative bg-white dark:bg-[#0e1117] dark:backdrop-blur-xl text-gray-800 p-8 rounded-xl shadow-xl w-full max-w-lg mx-auto border-t-[6px] transform transition-all duration-300 ease-in-out ${borderClass} ${isModalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
              >
                ×
              </button>

              <h2
                className={`text-2xl mb-6 text-center font-bold ${textClass}`}
              >
                {transactionType === 'receita' ? 'Adicionar Entrada' : 'Adicionar Saída'}
              </h2>

              <form className="space-y-4">
                <CustomField
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da transação"
                  required
                  isInvalid={isTitleInvalid}
                />
                <CustomField
                  name="value"
                  value={value}
                  onChange={(e) => {
                    let input = e.target.value.replace(/[^\d]/g, '');
                    const number = (parseFloat(input) / 100).toFixed(2);
                    const formatted = Number(number).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    });
                    setValue(formatted);
                  }}
                  placeholder="Valor"
                  required
                  isInvalid={isValueInvalid}
                />
                <CustomField
                  name="date"
                  type="date"
                  value={date}
                  className={!date ? 'text-gray-400' : 'text-black'}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  isInvalid={isDateInvalid}
                />
                <CustomDropdown
                  value={relates_to}
                  onChange={setrelates_to}
                  options={[
                    { label: 'Eventos', value: 'Eventos' },
                    { label: 'Produtos', value: 'Produtos' },
                    { label: 'Jogos', value: 'Jogos' },
                    { label: 'Outros', value: 'Outros' },
                  ]}
                  placeholder="Relacionado com"
                  required
                  isInvalid={isRelatesToInvalid}
                />

                <CustomField
                  name="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Observações (opcional)"
                />

                <div className="flex justify-end gap-4 pt-4">
                  <CustomButton
                    type="button"
                    onClick={handleRegisterTransaction}
                    disabled={isLoading}
                    className={buttonClass}
                  >
                    {buttonText}
                  </CustomButton>
                </div>
              </form>
            </Modal>
          );
        })()}

        <Modal
          isOpen={Boolean(transactionToDelete)}
          onRequestClose={() => setTransactionToDelete(null)}
          shouldCloseOnOverlayClick={true}
          overlayClassName="ReactModal__Overlay fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300"
          className={`relative bg-white dark:bg-[#0e1117] dark:backdrop-blur-xl text-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md mx-auto border-t-[6px] transform transition-all duration-300 ease-in-out border-red-800 dark:border-red-600 ${transactionToDelete ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <button
            onClick={() => setTransactionToDelete(null)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
          >
            ×
          </button>

          <h2 className="text-2xl mb-4 text-center font-bold text-red-800 dark:text-red-600">Confirmar Exclusão</h2>
          <p className="text-center text-sm text-gray-700 dark:text-gray-300 mb-6">
            Tem certeza que deseja excluir a transação <strong>{transactionToDelete?.title}</strong>?
          </p>

          <div className="flex justify-center">
            <CustomButton
              type="button"
              onClick={() => setTransactionToDelete(null)}
              className="!bg-gray-500 hover:!bg-gray-600"
            >
              Cancelar
            </CustomButton>
            <CustomButton
              type="button"
              onClick={() => handleConfirmDelete()}
              className={`!bg-red-800 ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-red-700'}`}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </CustomButton>
          </div>
        </Modal>

        <div className="mt-8 space-y-4 max-w-9xl mx-auto">
          <div className="mb-4 max-w-sm mx-auto">
            <CustomField
              icon={react.MagnifyingGlassIcon}
              name="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título..."
              clearable={searchTerm ? 'true' : ''}
              onClear={() => setSearchTerm('')}
            />
          </div>
          <div className={`flex flex-wrap gap-2 justify-center mb-4 mt-4 ${Object.entries(isFilterApplied).some(([_, value]) => value) ? '' : 'invisible h-7'}`}>
            {Object.entries(isFilterApplied).map(([key, value]) => {
              if (!value) return null;
              return (
                <div
                  key={key}
                  className="flex items-center px-4 py-1 rounded-full bg-gray-200 dark:bg-white/10 dark:backdrop-blur-md text-gray-800 dark:text-white text-sm font-medium shadow-sm"
                >
                  <span className="mr-2 capitalize">
                    {{
                      tipo: 'Tipo',
                      valor: 'Valor',
                      data: 'Data',
                      relates_to: 'Relacionado com',
                      user: 'Usuário'
                    }[key] || key.replace('_', ' ')}
                    :
                  </span>
                  <span className="font-semibold">{filterValues[key]}</span>
                  <button
                    onClick={() => clearFilters(key)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                    title="Limpar filtro"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          <div className="relative flex justify-between pr-6 font-bold max-w-9xl mx-auto">
            <div className="grid grid-cols-6 items-center gap-2 text-center flex-grow">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm dark:text-white">Tipo</span>
                <button
                  ref={(el) => (filterButtonRefs.current.tipo = el)}
                  onClick={() => isFilterApplied.tipo ? clearFilters('tipo') : toggleFilter('tipo')}
                >
                  <react.FunnelIcon size={16} className='dark:text-white' />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm dark:text-white">Título</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm dark:text-white">Valor</span>
                <button
                  ref={(el) => (filterButtonRefs.current.valor = el)}
                  onClick={() => isFilterApplied.valor ? clearFilters('valor') : toggleFilter('valor')}
                >
                  <react.FunnelIcon size={16} className='dark:text-white' />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm dark:text-white">Data</span>
                <button
                  ref={(el) => (filterButtonRefs.current.data = el)}
                  onClick={() => isFilterApplied.data ? clearFilters('data') : toggleFilter('data')}
                >
                  <react.FunnelIcon size={16} className='dark:text-white' />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm dark:text-white">Relacionado com</span>
                <button
                  ref={(el) => (filterButtonRefs.current.relates_to = el)}
                  onClick={() => isFilterApplied.relates_to ? clearFilters('relates_to') : toggleFilter('relates_to')}
                >
                  <react.FunnelIcon size={16} className='dark:text-white' />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm dark:text-white">Registrado por</span>
                <button
                  ref={(el) => (filterButtonRefs.current.user = el)}
                  onClick={() => isFilterApplied.user ? clearFilters('user') : toggleFilter('user')}
                >
                  <react.FunnelIcon size={16} className='dark:text-white' />
                </button>
              </div>
            </div>
            <div className='w-12 flex justify-center items-center'>
              <span className="text-sm text-center dark:text-white">Ações</span>
            </div>
          </div>

          {showFilterMenu && (
            <div
              ref={filterMenuRef}
              style={{ top: filterPosition.top, left: filterPosition.left }}
              className="absolute bg-gray-50 dark:bg-gray-900 p-4 shadow-xl rounded-md z-50"
            >
              <h3 className="text-lg font-semibold text-center mb-2">Selecione o filtro</h3>
              <div className="grid grid-cols-2">
                {filterMenuOptions.map((option, idx) => (
                  <button
                    key={option}
                    onClick={() => applyFilter(option)}
                    className="rounded-full hover:shadow-xl text-sm font-semibold hover:bg-transparent"
                  >
                    {selectedFilter === 'tipo' ? (
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${option === 'Entrada' ? 'bg-green-800 text-white' : 'bg-red-800 text-white'} inline-block`}
                      >
                        {option}
                      </span>
                    ) : (
                      option
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          {sortedTransactions.filter((transaction) =>
            transaction.title.toLowerCase().includes(searchTerm.toLowerCase())
          ).length === 0 ? (
            <div className="flex flex-col items-center justify-center text-red-900 dark:text-red-400 rounded-xl px-8 py-12 text-center text-base max-w-2xl mx-auto mt-12 animate-fade-in space-y-4">
              <react.WarningCircleIcon size={64} />
              <h3 className="text-2xl font-semibold">Nenhum resultado encontrado</h3>
              <p className="text-sm">Verifique se digitou corretamente o título da transação ou experimente outros termos para a busca.</p>
            </div>
          ) : (
            sortedTransactions
              .filter((transaction) =>
                transaction.title.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .slice(0, 100)
              .map((transaction) => (
                <div key={transaction.id} className="relative bg-white dark:bg-white/10 dark:border dark:border-white/10 flex justify-between rounded-xl shadow-md pr-6 py-8">
                  <div className="grid grid-cols-6 items-center gap-2 text-center flex-grow">
                    <div>
                      <span className={`text-xs font-medium px-4 py-0.5 rounded-full ${transaction.type === 'receita' ? 'bg-green-800 text-white' : 'bg-red-800 text-white'}`}
                        style={{ minWidth: '80px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
                        {transaction.type === 'receita' ? 'Entrada' : 'Saída'}
                      </span>
                    </div>
                    <div><h4 className="font-medium">{transaction.title}</h4></div>
                    <div className="text-sm">{Number(transaction.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                    <div className="text-sm">{new Date(transaction.date).toLocaleDateString('pt-BR')}</div>
                    <div className="text-sm">{transaction.relates_to}</div>

                    <div>
                      <span className="text-sm">{transaction.user_name ?? 'Usuário desconhecido'}</span>
                    </div>
                  </div>
                  <div className="w-12 flex justify-center items-center">
                    <div className="relative flex justify-end">
                      <div className=" relative group w-fit h-fit">
                        <react.DotsThreeVerticalIcon size={24} className="text-gray-700 dark:text-white cursor-pointer" />
                        <div className="absolute right-0 top-6 w-40 bg-white dark:bg-[#0e1117] dark:border dark:border-white/10 rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                          <button onClick={() => handleEditTransaction(transaction)} className="block w-full rounded-lg text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 text-sm">Editar transação</button>
                          <button onClick={() => handleDeleteTransaction(transaction)} className="block w-full rounded-lg text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-white/5 text-sm text-red-600 dark:text-red-400">Excluir transação</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isFilterModalOpen}
        onRequestClose={() => setIsFilterModalOpen(false)}
        overlayClassName="ReactModal__Overlay fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300"
        className="relative bg-white dark:bg-[#0e1117] dark:backdrop-blur-xl text-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border-t-[6px] border-gray-700 dark:border-white/10 transform transition-all duration-300 ease-in-out"
      >
        <button
          onClick={() => setIsFilterModalOpen(false)}
          className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">Filtrar por:</h2>
        <div className="grid grid-cols-1 gap-3">
          {filterMenuOptions.map((option) => (
            <button
              key={option}
              onClick={() => {
                applyFilter(option);
                setIsFilterModalOpen(false);
              }}
              className="py-2 px-4 rounded-lg bg-gray-300 dark:bg-white/10 hover:bg-gray-400 dark:hover:bg-white/20 transition text-center text-gray-800 dark:text-white font-medium"
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <CustomButton type="button" className={'bg-gray-800 hover:bg-gray-600 dark:bg-black dark:hover:bg-white/5'} onClick={() => setIsFilterModalOpen(false)}>
            Fechar
          </CustomButton>
        </div>
      </Modal>

      <Footer />
      <style>{`
              @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }

              .animate-fade-in {
                animation: fade-in 0.4s ease-out;
              }
            `}</style>
    </div >
  );
}

import withAdminProtection from '../../utils/withAdminProtection';
export default withAdminProtection(FinancialPage);