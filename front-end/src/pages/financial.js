import { useState, useEffect } from 'react';
import Header from '../components/header-admin';
import Footer from '../components/footer-admin';
import Modal from 'react-modal';

export default function FinancialPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState(null);
    const [title, setTitle] = useState('');
    const [value, setValue] = useState('');
    const [date, setDate] = useState('');
    const [relates_to, setrelates_to] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

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
            alert("Por favor, selecione a opção de 'Relacionado com'.");
            return;
        }

        const newTransaction = {
            title,
            value,
            date,
            relates_to,
            type: transactionType,
            user_id: 'f8664b4c-28c6-4d34-a750-48ab7308005b', // ID genérico
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
                setTotalAmount(prevAmount => prevAmount + (transactionType === 'income' ? value : -value));
                closeModal();
            } else {
                alert('Erro ao registrar transação');
            }
        } catch (error) {
            console.error('Erro ao registrar transação:', error);
            alert('Erro ao conectar com o servidor');
        }
    };

    return (
        <div className="financial-page flex flex-col min-h-screen">
            <Header />

            <div className="container mx-auto p-6 flex-grow">
                <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">Gestão Financeira</h1>

                {/* Cards for total values */}
                <div className="flex gap-8 justify-center mb-6">
                    <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg w-48 text-center">
                        <h3 className="font-semibold">Total em Caixa</h3>
                        <p className="text-2xl">{totalAmount}</p>
                    </div>
                    <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-lg w-48 text-center">
                        <h3 className="font-semibold">Total de Entradas</h3>
                        <p className="text-2xl">{totalAmount > 0 ? totalAmount : '0'}</p>
                    </div>
                    <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg w-48 text-center">
                        <h3 className="font-semibold">Total de Saídas</h3>
                        <p className="text-2xl">{totalAmount < 0 ? totalAmount : '0'}</p>
                    </div>
                </div>

                {/* Buttons for adding income and expenses */}
                <div className="flex gap-8 justify-center mb-6">
                    <button className="bg-green-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-green-700" onClick={() => openModal('income')}>
                        Adicionar Entrada
                    </button>
                    <button className="bg-red-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-red-700" onClick={() => openModal('expense')}>
                        Adicionar Saída
                    </button>
                </div>

                {/* Modal for adding transactions */}
                <Modal isOpen={isModalOpen} onRequestClose={closeModal} className="modal-container bg-white p-8 rounded-lg shadow-xl max-w-md mx-auto">
                    <h2 className="text-2xl mb-4">{transactionType === 'income' ? 'Adicionar Entrada' : 'Adicionar Saída'}</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold">Título</label>
                            <input type="text" className="w-full p-2 border border-gray-300 rounded" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold">Valor</label>
                            <input type="number" className="w-full p-2 border border-gray-300 rounded" value={value} onChange={(e) => setValue(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold">Data</label>
                            <input type="date" className="w-full p-2 border border-gray-300 rounded" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold">Relacionado com</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded text-gray-500"
                                value={relates_to}
                                onChange={(e) => setrelates_to(e.target.value)}
                            >
                                <option value="" disabled>Selecione uma opção</option> {/* Valor inicial com texto cinza */}
                                <option value="events">Eventos</option>
                                <option value="products">Produtos</option>
                                <option value="games">Jogos</option>
                                <option value="others">Outros</option>
                            </select>
                        </div>
                        <div>
                            <button type="button" className="bg-blue-600 text-white py-2 px-6 rounded-lg" onClick={handleRegisterTransaction}>
                                Registrar
                            </button>
                        </div>
                    </form>
                    <button className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-lg" onClick={closeModal}>Fechar</button>
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
                                    <td className="py-2 px-4">{user.name}</td>
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