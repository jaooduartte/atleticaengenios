import { useState, useEffect } from 'react';
import * as react from '@phosphor-icons/react';
import useAuth from '../../hooks/useAuth';
import Header from '../../components/header-admin';
import Footer from '../../components/footer-admin';
import Modal from 'react-modal';
import CustomField from '../../components/custom-field';
import CustomButton from '../../components/custom-buttom';
import CustomDropdown from '../../components/custom-dropdown';
import Banner from '../../components/banner';
import withAdminProtection from '../../utils/withAdminProtection';

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [amount, setAmount] = useState('');
    const [relates_to, setRelatesTo] = useState('');
    const [image, setImage] = useState(null);
    const [isTitleInvalid, setIsTitleInvalid] = useState(false);
    const [isDescriptionInvalid, setIsDescriptionInvalid] = useState(false);
    const [isValueInvalid, setIsValueInvalid] = useState(false);
    const [isAmountInvalid, setIsAmountInvalid] = useState(false);
    const [isRelatesToInvalid, setIsRelatesToInvalid] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showBanner, setShowBanner] = useState(false);
    const [bannerMessage, setBannerMessage] = useState('');
    const [bannerType, setBannerType] = useState('');
    const [bannerDescription, setBannerDescription] = useState('');
    const [styleFilter, setStyleFilter] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
                const data = await response.json();
                setProducts(data);
                setFilteredProducts(data);
            } catch (error) {
                console.error('Erro ao buscar produtos:', error);
            }
        };

        fetchProducts();
    }, []);

    // Filter logic
    const displayedProducts = products
      .filter((product) =>
        product.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((product) =>
        styleFilter === '' || product.relates_to === styleFilter
      );

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setTitle('');
        setDescription('');
        setValue('');
        setAmount('');
        setRelatesTo('');
        setImage(null);
        setIsTitleInvalid(false);
        setIsDescriptionInvalid(false);
        setIsValueInvalid(false);
        setIsAmountInvalid(false);
        setIsRelatesToInvalid(false);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Placeholder: handleDeleteProduct, handleFilter logic would go here

    const handleRegisterProduct = async () => {
        setIsTitleInvalid(!title);
        setIsDescriptionInvalid(!description);
        setIsValueInvalid(!value);
        setIsAmountInvalid(!amount);
        setIsRelatesToInvalid(!relates_to);

        if (!title || !description || !value || !amount || !relates_to) return;

        setIsLoading(true);
        try {
            const numericValue = Number(value.replace(/[^\d]/g, '')) / 100;

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('value', numericValue);
            formData.append('amount', amount);
            formData.append('relates_to', relates_to);
            if (image) formData.append('image', image);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error || 'Erro ao registrar produto');

            setBannerMessage('Produto cadastrado com sucesso!');
            setBannerDescription('');
            setBannerType('success');
            setShowBanner(true);
            setTimeout(() => setShowBanner(false), 4000);
            handleCloseModal();
        } catch (error) {
            console.error(error);
            setBannerMessage('Erro ao cadastrar produto');
            setBannerDescription(error.message || 'Erro inesperado');
            setBannerType('error');
            setShowBanner(true);
            setTimeout(() => setShowBanner(false), 4000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="products-page flex flex-col min-h-screen bg-white text-black dark:bg-[#0e1117] dark:text-white transition-colors duration-500 ease-in-out">
            <Header />
            <title>Produtos | Área Admin</title>
            {showBanner && (
                <Banner
                    message={bannerMessage}
                    description={bannerDescription}
                    type={bannerType}
                    className="absolute top-0 left-0 right-0 z-[100] p-4 text-white text-center shadow-md"
                />
            )}
            <div className="container mx-auto p-6 flex-grow">
                <h1 className="text-5xl font-bold mb-10 mt-4 text-center text-gray-800 dark:text-white">Gestão de Produtos</h1>

                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex-1 max-w-xs">
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
                    <div className="flex-1 max-w-xs">
                        <CustomDropdown
                            value={styleFilter}
                            onChange={(option) => setStyleFilter(option)}
                            options={[
                                { label: 'Todos os estilos', value: '' },
                                { label: 'Camisetas', value: 'Camisetas' },
                                { label: 'Shorts', value: 'Shorts' },
                                { label: 'Canecas', value: 'Canecas' },
                                { label: 'Outros', value: 'Outros' },
                            ]}
                            placeholder="Filtrar por estilo"
                        />
                    </div>
                    <CustomButton
                        className="!bg-green-800 hover:!bg-green-700"
                        onClick={handleOpenModal}
                    >
                        <span className="flex items-center gap-2">
                            <react.PlusIcon size={20} /> Adicionar Produto
                        </span>
                    </CustomButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {displayedProducts.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center text-red-900 dark:text-red-400 rounded-xl px-8 py-12 text-center text-base max-w-2xl mx-auto mt-12 animate-fade-in space-y-4">
                            <react.WarningCircleIcon size={64} />
                            <h3 className="text-2xl font-semibold">Nenhum produto encontrado</h3>
                            <p className="text-sm">Verifique se digitou corretamente o título do produto ou experimente outros termos para a busca.</p>
                        </div>
                    ) : (
                        displayedProducts.map((product) => (
                            <div key={product.id} className="bg-white dark:bg-white/10 dark:border dark:border-white/10 rounded-xl shadow-md p-6 flex flex-col items-center relative">
                                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-md mb-4 overflow-hidden flex items-center justify-center">
                                    {product.image ? (
                                        <img src={product.image} alt={product.title} className="object-cover w-full h-full" />
                                    ) : (
                                        <react.ImageIcon size={48} className="text-gray-400" />
                                    )}
                                </div>
                                <h3 className="text-lg font-bold mb-1 text-center">{product.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-300 mb-2 text-center">{product.description}</p>
                                <div className="flex flex-col items-center gap-1 w-full">
                                    <span className="font-bold text-green-800 dark:text-green-400 text-lg">
                                        {Number(product.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-200 dark:bg-white/10 dark:text-white text-gray-800 inline-block">
                                        {product.relates_to}
                                    </span>
                                    <span className="text-sm mt-1">Qtd: <strong>{product.amount}</strong></span>
                                </div>
                                {/* Ações: editar/excluir poderiam ir aqui */}
                            </div>
                        ))
                    )}
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={handleCloseModal}
                    shouldCloseOnOverlayClick={true}
                    overlayClassName="ReactModal__Overlay fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300"
                    className="relative bg-white dark:bg-[#0e1117] dark:backdrop-blur-xl text-gray-800 p-8 rounded-xl shadow-xl w-full max-w-lg mx-auto border-t-[6px] border-green-800 dark:border-green-600 transform transition-all duration-300 ease-in-out"
                >
                    <button
                        onClick={handleCloseModal}
                        className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
                    >
                        ×
                    </button>
                    <h2 className="text-2xl mb-6 text-center font-bold text-green-800 dark:text-green-600">
                        Adicionar Produto
                    </h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block font-semibold mb-1 text-gray-700 dark:text-white">Upload de Imagem</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setImage(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            />
                        </div>
                        <CustomField
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Título do produto"
                            required
                            isInvalid={isTitleInvalid}
                        />
                        <CustomField
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descrição"
                            required
                            isInvalid={isDescriptionInvalid}
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
                            placeholder="Valor (R$)"
                            required
                            isInvalid={isValueInvalid}
                        />
                        <CustomDropdown
                            value={relates_to}
                            onChange={setRelatesTo}
                            options={[
                                { label: 'Camisetas', value: 'Camisetas' },
                                { label: 'Shorts', value: 'Shorts' },
                                { label: 'Canecas', value: 'Canecas' },
                                { label: 'Outros', value: 'Outros' },
                            ]}
                            placeholder="Estilo"
                            required
                            isInvalid={isRelatesToInvalid}
                        />
                        <CustomField
                            name="amount"
                            value={amount}
                            type="number"
                            min="0"
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Quantidade inicial"
                            required
                            isInvalid={isAmountInvalid}
                        />
                        <div className="flex justify-end gap-4 pt-4">
                            <CustomButton
                                type="button"
                                onClick={handleRegisterProduct}
                                disabled={isLoading}
                                className={`!bg-green-800 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-green-700 dark:hover:!bg-green-700'}`}
                            >
                                {isLoading ? 'Registrando...' : 'Registrar'}
                            </CustomButton>
                        </div>
                    </form>
                </Modal>
            </div>
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
        </div>
    );
}

export default withAdminProtection(ProductsPage);