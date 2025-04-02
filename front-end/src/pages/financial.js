import { useState, useEffect } from 'react';
import { HandArrowDown, HandArrowUp } from '@phosphor-icons/react';
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
    const [title, setTitle] = useState('');
    const [value, setValue] = useState('');
    const [date, setDate] = useState('');
    const [relates_to, setrelates_to] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalIncomes, setTotalIncomes] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [note, setNote] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/financial/transactions');
                const data = await response.json();

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
    };

    const handleRegisterTransaction = async () => {
        console.log('relates_to:', relates_to);  // Verifique o valor aqui

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
            const response = await fetch('http://localhost:3001/api/financial/transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTransaction),
            });

            const data = await response.json();

            if (response.ok) {
                setTransactions([...transactions, data]);
                const parsedValue = parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
                const newTotalIncomes = transactionType === 'receita' ? totalIncomes + parsedValue : totalIncomes;
                const newTotalExpenses = transactionType === 'despesa' ? totalExpenses + parsedValue : totalExpenses;
                const newTotalAmount = newTotalIncomes - newTotalExpenses;

                setTotalIncomes(newTotalIncomes);
                setTotalExpenses(newTotalExpenses);
                setTotalAmount(newTotalAmount);
                showBannerMessage("Transação registrada com sucesso!", "success");
                closeModal();
            } else {
                showBannerMessage("Erro ao registrar transação", "error", "Verifique os campos preenchidos ou tente novamente.");
            }
        } catch (error) {
            console.error('Erro ao registrar transação:', error);
            showBannerMessage("Erro de conexão", "error", "Não foi possível se conectar ao servidor.");
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
                            {transactionType === 'receita' ? 'ADICIONAR ENTRADA' : 'ADICIONAR SAÍDA'}
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

                {/* Transaction Records Table */}
                <div className="overflow-x-auto mt-8">
                    <h3 className="text-xl font-semibold mb-4">Registros de Transações</h3>
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4">Título</th>
                                <th className="py-2 px-4">Relacionado com</th>
                                <th className="py-2 px-4">Valor</th>
                                <th className="py-2 px-4">Data</th>
                                <th className="py-2 px-4">Usuário</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.slice(0, 100).map((transaction, index) => (
                                <tr key={index}>
                                    <td className="py-2 px-4">{transaction.title}</td>
                                    <td className="py-2 px-4">{transaction.relates_to}</td>
                                    <td className="py-2 px-4">{transaction.value}</td>
                                    <td className="py-2 px-4">{transaction.date}</td>
                                    <td className="py-2 px-4">{user?.name || 'Usuário'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Footer />
        </div>
    );
}