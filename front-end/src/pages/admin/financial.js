import { useState, useEffect, useRef } from 'react';
import { HandArrowDown, HandArrowUp, MagnifyingGlass, DotsThreeVertical, WarningCircle, Funnel } from '@phosphor-icons/react';
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
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('last6months');
  const [chartData, setChartData] = useState({ incomes: [], expenses: [], labels: [] });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedFilterColumn, setSelectedFilterColumn] = useState(null);

  const [isTitleInvalid, setIsTitleInvalid] = useState(false);
  const [isValueInvalid, setIsValueInvalid] = useState(false);
  const [isDateInvalid, setIsDateInvalid] = useState(false);
  const [isRelatesToInvalid, setIsRelatesToInvalid] = useState(false);

  const [filterActive, setFilterActive] = useState({ tipo: false, valor: false, data: false, relates_to: false, user: false });
  const [isFilterApplied, setIsFilterApplied] = useState({ tipo: false, valor: false, data: false, relates_to: false, user: false });
  const [filterValues, setFilterValues] = useState({});
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });
  const [filterMenuOptions, setFilterMenuOptions] = useState([]);
  const [currentFilterValue, setCurrentFilterValue] = useState("");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef(null);

  const dropdownRef = useRef(null);
  const filterMenuRef = useRef(null);  // Referência para o menu de filtro

  const filterButtonRefs = useRef({
    tipo: null,
    valor: null,
    data: null,
    relates_to: null,
    user: null,
  });


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
        setShowFilterMenu(false);  // Fecha o menu de filtro
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Remove o event listener quando o componente for desmontado
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const groupByMonth = () => {
      const monthMap = {};

      // Obtendo a data atual e o limite para os últimos 6 meses
      const currentDate = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(currentDate.getMonth() - 6);

      transactions.forEach(t => {
        const transactionDate = new Date(t.date);

        // Verifique se a transação está dentro dos últimos 6 meses
        if (transactionDate >= sixMonthsAgo) {
          const month = `${(transactionDate.getMonth() + 1).toString().padStart(2, '0')}/${transactionDate.getFullYear()}`;
          if (!monthMap[month]) {
            monthMap[month] = { receita: 0, despesa: 0 };
          }
          monthMap[month][t.type] += parseFloat(t.value);
        }
      });

      // Ordenar os meses em ordem cronológica (mais recentes à direita)
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

    setFilteredTransactions(transactions.filter(t => {
      const conditions = [];
      if (newFilterValues.tipo) conditions.push(t.type === (newFilterValues.tipo === 'Entrada' ? 'receita' : 'despesa'));
      if (newFilterValues.relates_to) conditions.push(t.relates_to === newFilterValues.relates_to);
      if (newFilterValues.data) {
        const d = new Date(t.date);
        const now = new Date();
        if (newFilterValues.data === 'Últimos 6 meses') {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(now.getMonth() - 6);
          conditions.push(d >= sixMonthsAgo && d <= now);
        }
        if (newFilterValues.data === 'Últimos 3 anos') {
          const threeYearsAgo = new Date();
          threeYearsAgo.setFullYear(now.getFullYear() - 3);
          conditions.push(d >= threeYearsAgo && d <= now);
        }
      }
      if (newFilterValues.user) conditions.push(t.user_name === newFilterValues.user);
      return conditions.every(Boolean);
    }));
  };
  const clearFilters = (column) => {
    const updatedFilterValues = { ...filterValues };
    delete updatedFilterValues[column];
    setFilterValues(updatedFilterValues);
    setIsFilterApplied(prev => ({ ...prev, [column]: false }));

    const newFiltered = transactions.filter(t => {
      let valid = true;
      if (updatedFilterValues.tipo) {
        valid = valid && (t.type === (updatedFilterValues.tipo === 'Entrada' ? 'receita' : 'despesa'));
      }
      if (updatedFilterValues.relates_to) {
        valid = valid && (t.relates_to === updatedFilterValues.relates_to);
      }
      if (updatedFilterValues.data) {
        const d = new Date(t.date);
        const now = new Date();
        if (updatedFilterValues.data === 'Últimos 6 meses') {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(now.getMonth() - 6);
          valid = valid && (d >= sixMonthsAgo && d <= now);
        }
        if (updatedFilterValues.data === 'Últimos 3 anos') {
          const threeYearsAgo = new Date();
          threeYearsAgo.setFullYear(now.getFullYear() - 3);
          valid = valid && (d >= threeYearsAgo && d <= now);
        }
      }
      if (updatedFilterValues.user) {
        valid = valid && (t.user_name === updatedFilterValues.user);
      }
      return valid;
    });
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

  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
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
    // Validação de campos obrigatórios
    if (!title) {
      setIsTitleInvalid(true);
    } else {
      setIsTitleInvalid(false);
    }

    if (!value) {
      setIsValueInvalid(true);
    } else {
      setIsValueInvalid(false);
    }

    if (!date) {
      setIsDateInvalid(true);
    } else {
      setIsDateInvalid(false);
    }

    if (!relates_to) {
      setIsRelatesToInvalid(true);
    } else {
      setIsRelatesToInvalid(false);
    }

    if (isTitleInvalid || isValueInvalid || isDateInvalid || isRelatesToInvalid) {
      showBannerMessage('Preencha todos os campos obrigatórios!', 'error');
      return;
    }

    setIsLoading(true);
    const newTransaction = {
      title,
      value: parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')),
      date,
      relates_to,
      note,
      type: transactionType,
      user_id: user?.id,
    };



    try {
      const url = editingTransactionId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/financial/transaction/${editingTransactionId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/financial/transaction`;
      const method = editingTransactionId ? 'PUT' : 'POST';

      const token = localStorage.getItem('token'); // PEGAR O TOKEN DO LOCALSTORAGE

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
        const updatedTransaction = {
          ...data,
          user_name: user.name,
        };

        let updatedTransactions = [];
        if (editingTransactionId) {
          updatedTransactions = transactions.map((t) =>
            t.id === editingTransactionId ? updatedTransaction : t
          );
        } else {
          updatedTransactions = [...transactions, updatedTransaction];
        }

        setTransactions(updatedTransactions);
        setFilteredTransactions(updatedTransactions);

        // Recalcular totais
        const total = updatedTransactions.reduce((acc, t) => {
          const val = parseFloat(t.value);
          return t.type === 'receita' ? acc + val : acc - val;
        }, 0);
        setTotalAmount(total);

        const incomes = updatedTransactions
          .filter((t) => t.type === 'receita')
          .reduce((acc, t) => acc + parseFloat(t.value), 0);
        const expenses = updatedTransactions
          .filter((t) => t.type === 'despesa')
          .reduce((acc, t) => acc + parseFloat(t.value), 0);

        setTotalIncomes(incomes);
        setTotalExpenses(expenses);

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
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Gráfico de Receitas e Despesas' }
    }
  };

  const applyTypeFilter = (value) => {
    if (value === 'Entrada') {
      setFilteredTransactions(transactions.filter(t => t.type === 'receita'));
    } else if (value === 'Saída') {
      setFilteredTransactions(transactions.filter(t => t.type === 'despesa'));
    } else {
      setFilteredTransactions(transactions);
    }
  };

  const applyValueFilter = (order) => {
    const sortedTransactions = [...transactions].sort((a, b) => {
      const valueA = parseFloat(a.value);
      const valueB = parseFloat(b.value);
      return order === 'Maior valor' ? valueB - valueA : valueA - valueB;
    });
    setFilteredTransactions(sortedTransactions);
  };

  const applyDateFilter = (startDate, endDate) => {
    setFilteredTransactions(transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    }));
  };

  const applyRelatesToFilter = (value) => {
    setFilteredTransactions(transactions.filter(t => t.relates_to === value));
  };

  const applyUserFilter = (value) => {
    setFilteredTransactions(transactions.filter(t => t.user_name === value));
  };

  const handleFilterSelection = (value) => {
    setShowFilterMenu(false);
    setCurrentFilterValue(value);
    setFilterActive((prev) => ({ ...prev, [selectedFilter]: false }));
    setSelectedFilter(null);
    setShowFilterMenu(false);
    // Aqui, aplique a lógica de filtro
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Receitas',
        data: chartData.incomes,
        backgroundColor: '#166534',
      },
      {
        label: 'Despesas',
        data: chartData.expenses,
        backgroundColor: '#991b1b',
      },
    ],
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

        {/* Cards for total values */}
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
                <HandArrowDown size={20} />
                Entrada
              </button>
              <button
                className="flex flex-col items-center justify-center gap-1 bg-red-900 hover:bg-red-700 transition-colors text-white py-3 px-6 rounded-lg shadow text-xs font-medium w-full"
                onClick={() => openModal('despesa')}
              >
                <HandArrowUp size={20} />
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

        {/* Removed the overall chart block as charts are now integrated within the cards */}


        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          shouldCloseOnOverlayClick={true}
          overlayClassName="ReactModal__Overlay fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300"
          className={`relative bg-white dark:bg-[#0e1117] dark:backdrop-blur-xl text-gray-800 p-8 rounded-xl shadow-xl w-full max-w-lg mx-auto border-t-[6px] transform transition-all duration-300 ease-in-out ${transactionType === 'receita'
            ? 'border-green-800 dark:border-green-600'
            : 'border-red-800 dark:border-red-600'
            } ${isModalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 hover:text-black text-xl"
          >
            ×
          </button>

          <h2
            className={`text-2xl mb-6 text-center font-bold 
              ${transactionType === 'receita'
                ? 'text-green-800 dark:text-green-600'
                : 'text-red-800 dark:text-red-600'
              }`}
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
                className={transactionType === 'receita'
                  ? '!bg-green-800 hover:!bg-green-700 dark:!bg-green-600 dark:hover:!bg-green-700'
                  : '!bg-red-800 hover:!bg-red-700 dark:!bg-red-600 dark:hover:!bg-red-700'}
              >
                {isLoading ? 'Registrando...' : 'Registrar'}
              </CustomButton>
            </div>
          </form>
        </Modal>

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
              className="!bg-red-800 hover:!bg-red-700"
            >
              Excluir
            </CustomButton>
          </div>
        </Modal>

        {/* Transaction Records as Cards */}
        <div className="mt-8 space-y-4 max-w-9xl mx-auto">
          <div className="mb-4 max-w-sm mx-auto">
            <CustomField
              icon={MagnifyingGlass}
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
                  <Funnel size={16} className='dark:text-white' />
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
                  <Funnel size={16} className='dark:text-white' />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm dark:text-white">Data</span>
                <button
                  ref={(el) => (filterButtonRefs.current.data = el)}
                  onClick={() => isFilterApplied.data ? clearFilters('data') : toggleFilter('data')}
                >
                  <Funnel size={16} className='dark:text-white' />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm dark:text-white">Relacionado com</span>
                <button
                  ref={(el) => (filterButtonRefs.current.relates_to = el)}
                  onClick={() => isFilterApplied.relates_to ? clearFilters('relates_to') : toggleFilter('relates_to')}
                >
                  <Funnel size={16} className='dark:text-white' />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm dark:text-white">Registrado por</span>
                <button
                  ref={(el) => (filterButtonRefs.current.user = el)}
                  onClick={() => isFilterApplied.user ? clearFilters('user') : toggleFilter('user')}
                >
                  <Funnel size={16} className='dark:text-white' />
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
                    key={idx}
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
              <WarningCircle size={64} />
              <h3 className="text-2xl font-semibold">Nenhum resultado encontrado</h3>
              <p className="text-sm">Verifique se digitou corretamente o título da transação ou experimente outros termos para a busca.</p>
            </div>
          ) : (
            sortedTransactions
              .filter((transaction) =>
                transaction.title.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .slice(0, 100)
              .map((transaction, index) => (
                <div key={index} className="relative bg-white dark:bg-white/10 dark:border dark:border-white/10 flex justify-between rounded-xl shadow-md pr-6 py-8">
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
                        <DotsThreeVertical size={24} className="text-gray-700 dark:text-white cursor-pointer" />
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
          {filterMenuOptions.map((option, idx) => (
            <button
              key={idx}
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
      <style jsx global>{`
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