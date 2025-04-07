import { useState, useEffect, useRef } from 'react';
import { HandArrowDown, HandArrowUp, MagnifyingGlass, DotsThreeVertical, WarningCircle } from '@phosphor-icons/react';
import Header from '../components/header-admin';
import Footer from '../components/footer-admin';
import Modal from 'react-modal';
import useAuth from '../hooks/useAuth';
import CustomField from '../components/custom-field';
import CustomButton from '../components/custom-buttom';
import CustomDropdown from '../components/custom-dropdown';
import Banner from '../components/banner';

export default function FinancialPage() {
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
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/financial/transactions');
                const data = await response.json();
                console.log(data);

                if (response.ok) {
                    setTransactions(data);

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
    }, []);

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
        if (!relates_to) {
            showBannerMessage("Campo obrigatório!", "error", "Por favor, selecione a opção de 'Relacionado com'.");
            return;
        }

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
                ? `http://localhost:3001/api/financial/transaction/${editingTransactionId}`
                : 'http://localhost:3001/api/financial/transaction';

            const method = editingTransactionId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTransaction),
            });

            const data = await response.json();

            if (response.ok) {
                if (editingTransactionId) {
                    setTransactions((prev) =>
                        prev.map((t) => {
                            if (t.id === editingTransactionId) {
                                return {
                                    ...t,
                                    ...data,
                                    user_name: t.user_name, // preserva o nome do usuário original
                                };
                            }
                            return t;
                        })
                    );
                    showBannerMessage("Transação atualizada com sucesso!", "success");
                } else {
                    setTransactions([...transactions, data]);

                    const parsedValue = newTransaction.value;
                    const newTotalIncomes = transactionType === 'receita' ? totalIncomes + parsedValue : totalIncomes;
                    const newTotalExpenses = transactionType === 'despesa' ? totalExpenses + parsedValue : totalExpenses;
                    const newTotalAmount = newTotalIncomes - newTotalExpenses;

                    setTotalIncomes(newTotalIncomes);
                    setTotalExpenses(newTotalExpenses);
                    setTotalAmount(newTotalAmount);
                    showBannerMessage("Transação registrada com sucesso!", "success");
                }

                closeModal();
            } else {
                showBannerMessage("Erro ao registrar transação", "error", "Verifique os campos preenchidos ou tente novamente.");
            }
        } catch (error) {
            console.error('Erro ao registrar transação:', error);
            showBannerMessage("Erro de conexão", "error", "Não foi possível se conectar ao servidor.");
        }
    };

    const handleConfirmDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/financial/transaction/${transactionToDelete.id}`, {
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

    return (
        <div className="financial-page flex flex-col min-h-screen">
            <Header />

            {showBanner && <Banner message={bannerMessage} description={bannerDescription} type={bannerType} />}

            <div className="container mx-auto p-6 flex-grow">
                <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">Gestão Financeira</h1>

                {/* Cards for total values */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-white">
                    <div className="m-8 bg-green-900 p-6 rounded-xl shadow-md text-center">
                        <h3 className="text-lg font-semibold mb-2">Total de Receita</h3>
                        <p className="text-2xl font-bold">{totalIncomes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                    <div className="bg-gray-700 flex flex-col justify-center p-6 rounded-xl shadow-md text-center">
                        <h3 className="text-2xl font-semibold mb-2">Total em Caixa</h3>
                        <p className="text-4xl font-bold">{totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>

                    </div>
                    <div className="m-8 bg-red-900 p-6 rounded-xl shadow-md text-center">
                        <h3 className="text-lg font-semibold mb-2">Total de Despesas</h3>
                        <p className="text-2xl font-bold">{totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 justify-center mb-8 px-4 max-w-xs mx-auto">
                    <button
                        className="flex flex-col items-center justify-center gap-2 bg-green-800 hover:bg-green-700 transition-colors text-white py-4 px-2 rounded-lg shadow-md text-sm font-medium"
                        onClick={() => openModal('receita')}
                    >
                        <HandArrowDown size={36} />
                        Registrar Entrada
                    </button>
                    <button
                        className="flex flex-col items-center justify-center gap-2 bg-red-800 hover:bg-red-700 transition-colors text-white py-4 px-2 rounded-lg shadow-md text-sm font-medium"
                        onClick={() => openModal('despesa')}
                    >
                        <HandArrowUp size={36} />
                        Registrar Saída
                    </button>
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    shouldCloseOnOverlayClick={true}
                    overlayClassName="ReactModal__Overlay fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300"
                    className={`relative bg-white text-gray-800 p-8 rounded-xl shadow-xl w-full max-w-lg mx-auto border-t-[6px] transform transition-all duration-300 ease-in-out ${transactionType === 'receita' ? 'border-green-800' : 'border-red-800'
                        } ${isModalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                >
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
                    >
                        ×
                    </button>

                    <h2
                        className={`text-2xl mb-6 text-center font-bold ${transactionType === 'receita' ? 'text-green-800' : 'text-red-800'
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
                            required />

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
                            required />

                        <CustomField
                            name="date"
                            type="date"
                            value={date}
                            className={!date ? 'text-gray-400' : 'text-black'}
                            onChange={(e) => setDate(e.target.value)}
                            required />

                        <CustomDropdown
                            value={relates_to}
                            onChange={setrelates_to}
                            options={['Eventos', 'Produtos', 'Jogos', 'Outros']}
                            placeholder="Relacionado com"
                            required />

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
                                className={transactionType === 'receita'
                                    ? '!bg-green-800 hover:!bg-green-700 dark:!bg-green-800 dark:hover:!bg-green-700'
                                    : '!bg-red-800 hover:!bg-red-700 dark:!bg-red-800 dark:hover:!bg-red-700'}
                            >
                                Registrar
                            </CustomButton>
                        </div>
                    </form>
            </Modal>
            
            <Modal
              isOpen={Boolean(transactionToDelete)}
              onRequestClose={() => setTransactionToDelete(null)}
              shouldCloseOnOverlayClick={true}
              overlayClassName="ReactModal__Overlay fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300"
              className={`relative bg-white text-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md mx-auto border-t-[6px] transform transition-all duration-300 ease-in-out border-red-800 ${transactionToDelete ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
              <button
                onClick={() => setTransactionToDelete(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
              >
                ×
              </button>

              <h2 className="text-2xl mb-4 text-center font-bold text-red-800">Confirmar Exclusão</h2>
              <p className="text-center text-sm text-gray-700 mb-6">
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

                {/* Transaction Records Table */}
                {/* Transaction Records as Cards */}
                <div className="mt-8 space-y-4 max-w-9xl mx-auto">
                    <div className="mb-4 max-w-sm mx-auto">
                        <CustomField
                            icon={MagnifyingGlass}
                            name="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por título..."
                            clearable
                            onClear={() => setSearchTerm('')}
                        />
                    </div>
                    <div className="relative flex justify-between pr-6 font-bold max-w-9xl mx-auto">
                        <div className="grid grid-cols-6 items-center gap-2 text-center flex-grow">
                            <span className="text-md">Tipo</span>
                            <span className="text-md">Título</span>
                            <span className="text-md">Valor</span>
                            <span className="text-md">Data</span>
                            <span className="text-md">Relacionado com</span>
                            <span className="text-md">Registrado por</span>
                        </div>
                        <div className="w-12 flex justify-center items-center">
                            <span className="text-md text-center">Ações</span>
                        </div>
                    </div>
                    {transactions.filter((transaction) =>
                        transaction.title.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-red-900 rounded-xl px-8 py-12 text-center text-base max-w-2xl mx-auto mt-12 animate-fade-in space-y-4">
                            <WarningCircle size={64} className="text-red-500" />
                            <h3 className="text-2xl font-semibold">Nenhum resultado encontrado</h3>
                            <p className="text-sm">Verifique se digitou corretamente o título da transação ou experimente outros termos para a busca.</p>
                        </div>
                    ) : (
                        transactions
                            .filter((transaction) =>
                                transaction.title.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .slice(0, 100)
                            .map((transaction, index) => (
                                <div key={index} className="relative bg-white flex justify-between rounded-xl shadow-md pr-6 py-8 border border-gray-200">
                                    <div className="grid grid-cols-6 items-center gap-2 text-center flex-grow">
                                        <div>
                                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${transaction.type === 'receita' ? 'bg-green-800 text-white' : 'bg-red-800 text-white'}`}>
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
                                            <div className="relative group w-fit h-fit">
                                                <DotsThreeVertical size={24} className="text-gray-700 cursor-pointer" />
                                                <div className="absolute right-0 top-6 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                                                    <button onClick={() => handleEditTransaction(transaction)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Editar transação</button>
                                                    <button onClick={() => handleDeleteTransaction(transaction)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600">Excluir transação</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>

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
        </div>
    );
}