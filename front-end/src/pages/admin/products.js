import { useState, useEffect } from 'react';
import Image from 'next/image';
import * as react from '@phosphor-icons/react';
import Header from '../../components/header-admin';
import Footer from '../../components/footer-admin';
import Modal from 'react-modal';
import CustomField from '../../components/custom-field';
import CustomButton from '../../components/custom-buttom';
import CustomDropdown from '../../components/custom-dropdown';
import ActionsDropdown from '../../components/ActionsDropdown';
import Banner from '../../components/banner';
import withAdminProtection from '../../utils/withAdminProtection';
import RichTextEditor from '../../components/rich-text-editor.js';
import { useLoading } from '../../context/LoadingContext';

function ProductsPage() {
	const [products, setProducts] = useState([]);
	const [showLowStockOnly, setShowLowStockOnly] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [productToDelete, setProductToDelete] = useState(null);
	const [productToEdit, setProductToEdit] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { setLoading } = useLoading();
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [value, setValue] = useState('');
	const [amount, setAmount] = useState('');
	const [relates_to, setRelatesTo] = useState('');
	const [image, setImage] = useState(null);
	const [isTitleInvalid, setIsTitleInvalid] = useState(false);
	const [isValueInvalid, setIsValueInvalid] = useState(false);
	const [isAmountInvalid, setIsAmountInvalid] = useState(false);
	const [, setIsDescriptionInvalid] = useState(false);
	const [isRelatesToInvalid, setIsRelatesToInvalid] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [showBanner, setShowBanner] = useState(false);
	const [bannerMessage, setBannerMessage] = useState("");
	const [bannerDescription, setBannerDescription] = useState("");
	const [bannerType, setBannerType] = useState("success");
	const [styleFilter, setStyleFilter] = useState('');
	const [sortOrder, setSortOrder] = useState('recent-desc');

	const showBannerMessage = (message, type, description = '') => {
		setBannerMessage(message);
		setBannerDescription(description);
		setBannerType(type);
		setShowBanner(true);
		setTimeout(() => setShowBanner(false), 4500);
	};

	const fetchProducts = async () => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
			const data = await response.json();
			setProducts(data);
		} catch (error) {
			console.error('Erro ao buscar produtos:', error);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	const filteredProductsLowStock = showLowStockOnly
		? products.filter((product) => product.amount <= 10)
		: products;

	const displayedProducts = filteredProductsLowStock
		.filter((product) =>
			product.title?.toLowerCase().includes(searchTerm.toLowerCase())
		)
		.filter((product) =>
			styleFilter === '' || product.relates_to === styleFilter
		);

	const sortedProducts = [...displayedProducts].sort((a, b) => {
		switch (sortOrder) {
			case 'recent-desc':
				return new Date(b.created_at) - new Date(a.created_at);
			case 'recent-asc':
				return new Date(a.created_at) - new Date(b.created_at);
			case 'alpha-asc':
				return a.title.localeCompare(b.title);
			case 'alpha-desc':
				return b.title.localeCompare(a.title);
			case 'price-asc':
				return a.value - b.value;
			case 'price-desc':
				return b.value - a.value;
			default:
				return 0;
		}
	});

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


	const handleRegisterProduct = async () => {
		setIsTitleInvalid(!title);
		setIsDescriptionInvalid(!description);
		setIsValueInvalid(!value);
		setIsAmountInvalid(!amount);
		setIsRelatesToInvalid(!relates_to);

		if (!title || !description || !value || !amount || !relates_to) return;

		setIsLoading(true);
		setLoading(true);
		try {
			const numericValue = Number(value.replace(/[^\d]/g, '')) / 100;

			const formData = new FormData();
			formData.append('title', title);
			formData.append('description', description);
			formData.append('value', numericValue);
			formData.append('amount', amount);
			formData.append('relates_to', relates_to);
			if (typeof image === 'object' && image?.url) {
				formData.append('image', image.url);
			}
			if (image instanceof File) formData.append('image', image);

			const url = productToEdit
				? `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productToEdit}`
				: `${process.env.NEXT_PUBLIC_API_URL}/api/products`;
			const method = productToEdit ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				body: formData,
			});

			const result = await response.json();

			if (!response.ok) throw new Error(result.error || 'Erro ao registrar produto');

			showBannerMessage(
				productToEdit ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!',
				'success'
			);
			handleCloseModal();
			fetchProducts();
			setProductToEdit(null);
		} catch (error) {
			console.error(error);
			showBannerMessage(
				productToEdit ? 'Erro ao atualizar produto' : 'Erro ao cadastrar produto',
				'error',
				error.message || 'Erro inesperado'
			);
		} finally {
			setIsLoading(false);
			setLoading(false);
		}
	};

	const handleEditProduct = (product) => {
		setTitle(product.title);
		setDescription(product.description);
		setValue(Number(product.value).toLocaleString('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}));
		setAmount(product.amount.toString());
		setRelatesTo(product.relates_to);
		setImage(product.image ? { url: product.image } : null);
		setProductToEdit(product.id);
		setIsModalOpen(true);
	};


	const handleConfirmDelete = async () => {
		try {
			setIsDeleting(true);
			setLoading(true);
			await fetch(`http://localhost:3001/api/products/${productToDelete.id}`, {
				method: 'DELETE',
			});
			showBannerMessage('Produto excluído com sucesso!', 'success');
			setProductToDelete(null);
			fetchProducts(); 
		} catch (error) {
			console.error('Erro ao excluir produto:', error);
		} finally {
			setIsDeleting(false);
			setLoading(false);
		}
	};

	const handleSellProduct = async (productId) => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}/sell`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) throw new Error('Erro ao realizar venda do produto');

			showBannerMessage('Venda realizada com sucesso!', 'success');
			fetchProducts();
		} catch (err) {
			console.error('Erro ao realizar venda:', err);
			showBannerMessage('Erro ao realizar venda do produto', 'error');
		}
	};

	const handleDuplicateProduct = async (product) => {
		try {
			const formData = new FormData();
			formData.append('title', `${product.title} (Cópia)`);
			formData.append('description', product.description);
			formData.append('value', product.value);
			formData.append('amount', product.amount);
			formData.append('relates_to', product.relates_to);
			if (product.image) {
				const response = await fetch(product.image);
				const blob = await response.blob();
				const fileExt = product.image.split('.').pop().split('?')[0];
				const file = new File([blob], `duplicated.${fileExt}`, { type: blob.type });
				formData.append('image', file);
			}

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
				method: 'POST',
				body: formData,
			});

			const result = await response.json();

			if (!response.ok) throw new Error(result.error || 'Erro ao duplicar produto');

			showBannerMessage('Produto duplicado com sucesso!', 'success');
			fetchProducts();
		} catch (error) {
			console.error('Erro ao duplicar produto:', error);
			showBannerMessage('Erro ao duplicar produto', 'error');
		}
	};

	return (
		<div className="products-page flex flex-col min-h-screen bg-white text-black dark:bg-[#0e1117] dark:text-white transition-colors duration-500 ease-in-out">
			<Header />
			<title>Produtos | Área Admin</title>
			{showBanner && (
				<Banner
					type={bannerType}
					message={bannerMessage}
					description={bannerDescription}
					onClose={() => setShowBanner(false)}
				/>
			)}
			<div className="container mx-auto p-6 flex-grow">
				<h1 className="text-5xl font-bold mb-10 mt-4 text-center text-gray-800 dark:text-white">Gestão de Produtos</h1>

				<div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
					<div className="flex w-full items-center gap-4">
						<div className="w-full max-w-xs">
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
						<div className="w-full max-w-xs">
							<CustomDropdown
								value={styleFilter}
								onChange={(option) => setStyleFilter(option)}
								options={[
									{ label: 'Todos as categorias', value: '' },
									{ label: 'Camisetas', value: 'Camisetas' },
									{ label: 'Shorts', value: 'Shorts' },
									{ label: 'Canecas', value: 'Canecas' },
									{ label: 'Outros', value: 'Outros' },
								]}
								placeholder="Filtrar por categoria"
							/>
						</div>
						<div className="w-full max-w-xs">
							<CustomDropdown
								value={sortOrder}
								onChange={(option) => setSortOrder(option)}
								options={[
									{ label: 'Mais recente', value: 'recent-desc' },
									{ label: 'Mais antigo', value: 'recent-asc' },
									{ label: 'A → Z', value: 'alpha-asc' },
									{ label: 'Z → A', value: 'alpha-desc' },
									{ label: 'Maior preço', value: 'price-desc' },
									{ label: 'Menor preço', value: 'price-asc' },
								]}
								placeholder="Ordenar por"
							/>
						</div>
						<button
							title='Filtrar por estoque baixo'
							onClick={() => setShowLowStockOnly((prev) => !prev)}
							className={`items-center p-2 rounded-full text-sm shadow-sm transition-all duration-200 ${showLowStockOnly
								? 'bg-red-900 text-white shadow-[0_0_12px_rgba(255,0,0,0.7)]'
								: 'text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20'
								}`}
						>
							<react.PackageIcon size={25} />
						</button>
					</div>
					<div>
						<CustomButton
							className="bg-red-700 hover:bg-red-600 dark:bg-red-900 dark:hover:bg-red-800 w-fit px-6 py-2 justify-end"
							onClick={handleOpenModal}
						>
							<span className="flex items-center justify-center gap-2 text-sm whitespace-nowrap">
								<react.PlusIcon size={18} /> Adicionar produto
							</span>
						</CustomButton>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
					{sortedProducts.length === 0 ? (
						<div className="col-span-full flex flex-col items-center justify-center text-red-900 dark:text-red-400 rounded-xl px-8 py-12 text-center text-base max-w-2xl mx-auto mt-12 animate-fade-in space-y-4">
							<react.WarningCircleIcon size={64} />
							<h3 className="text-2xl font-semibold">Nenhum produto encontrado</h3>
							<p className="text-sm">Verifique se digitou corretamente o título do produto ou experimente outros termos para a busca.</p>
						</div>
					) : (
						sortedProducts.map((product) => (
							<div
								key={product.id}
								className={`relative bg-white dark:bg-white/10 dark:border dark:border-white/10 rounded-xl p-6 flex flex-col items-center justify-between transition-transform hover:scale-[1.02] ${product.amount === 0
									? 'shadow-bright-red'
									: product.amount <= 10
										? 'shadow-bright-orange'
										: 'shadow-md'
									}`}
							>
								<div className="absolute top-2 right-2 z-10">
									<ActionsDropdown
										items={[
											{
												label: 'Editar produto',
												icon: react.PencilSimple,
												onClick: () => handleEditProduct(product),
											},
											{
												label: 'Duplicar produto',
												icon: react.Copy,
												onClick: () => handleDuplicateProduct(product),
											},
											{
												label: 'Realizar venda',
												icon: react.ShoppingCart,
												onClick: () => handleSellProduct(product.id),
												disabled: product.amount === 0,
											},
											{
												label: 'Excluir produto',
												icon: react.Trash,
												onClick: () => setProductToDelete(product),
											},
										]}
									/>
								</div>
								<div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-md mb-4 overflow-hidden flex items-center justify-center">
									{product.image ? (
										<Image src={product.image} alt={product.title} className="object-cover w-full h-full" width={128} height={128} />
									) : (
										<react.ImageIcon size={48} className="text-gray-400" />
									)}
								</div>
								<h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-1">{product.title}</h3>
								<span className="font-bold text-green-800 dark:text-green-400 text-base mt-1">
									{Number(product.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
								</span>
								<span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 dark:text-white text-gray-800 mt-2">
									{product.relates_to}
								</span>
								<span className="text-sm mt-2 font-medium text-gray-700 dark:text-white/80">
									{product.amount === 0 ? (
										<strong className="text-red-600">Sem estoque</strong>
									) : (
										<>
											Estoque:{' '}
											<strong
												className={`${product.amount <= 10
													? 'text-orange-500'
													: 'text-gray-700 dark:text-white/80'
													}`}
											>
												{product.amount}
											</strong>
										</>
									)}
								</span>
							</div>
						))
					)}
				</div>

				<Modal
					isOpen={isModalOpen}
					onRequestClose={handleCloseModal}
					shouldCloseOnOverlayClick={true}
					overlayClassName="ReactModal__Overlay fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300"
					className="relative bg-white dark:bg-[#0e1117] dark:backdrop-blur-xl text-gray-800 p-8 rounded-xl shadow-xl w-full max-w-lg mx-auto border-t-[6px] border-[#B3090F] dark:border-red-600 transform transition-all duration-300 ease-in-out"
				>
					<button
						onClick={handleCloseModal}
						className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
					>
						×
					</button>
					<h2 className="text-2xl mb-6 text-center font-bold text-[#B3090F] dark:text-red-600">
						Adicionar Produto
					</h2>
					<form className="space-y-4">
						<div className="flex justify-center mb-4">
							<div className="relative group w-24 h-24">
								{image ? (
									<Image
										src={image instanceof File ? URL.createObjectURL(image) : image.url}
										alt="Pré-visualização"
										className="w-24 h-24 rounded-md object-cover shadow-md"
										width={96}
										height={96}
									/>
								) : (
									<div className="w-24 h-24 rounded-md bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 text-sm">
										Sem imagem
									</div>
								)}
								<label
									htmlFor="productImage"
									className="absolute inset-0 backdrop-blur-sm bg-white/40 dark:bg-[#0e1117]/40 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
								>
									<react.CameraIcon size={24} className="text-[#B3090F]" />
									<input
										id="productImage"
										type="file"
										accept="image/*"
										onChange={(e) => setImage(e.target.files?.[0] || null)}
										hidden
									/>
								</label>
							</div>
						</div>
						<div>
							<label className="block mb-2 font-semibold pl-2 dark:text-white/70 " htmlFor="title">
								Título do produto
							</label>
							<CustomField
								name="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
								isInvalid={isTitleInvalid}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block mb-2 pl-2 dark:text-white/70 font-semibold" htmlFor="value">
									Valor
								</label>
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
									required
									isInvalid={isValueInvalid}
								/>
							</div>
							<div>
								<label className="block mb-2 pl-2 dark:text-white/70 font-semibold" htmlFor="amount">
									Estoque
								</label>
								<CustomField
									name="amount"
									value={amount}
									type="number"
									min="0"
									onChange={(e) => setAmount(e.target.value)}
									required
									isInvalid={isAmountInvalid}
								/>
							</div>
						</div>
						<div>
							<label className="block mb-2 pl-2 dark:text-white/70 font-semibold" htmlFor="relates_to">
								Categoria
							</label>
							<CustomDropdown
								value={relates_to}
								onChange={setRelatesTo}
								options={[
									{ label: 'Camisetas', value: 'Camisetas' },
									{ label: 'Shorts', value: 'Shorts' },
									{ label: 'Canecas', value: 'Canecas' },
									{ label: 'Outros', value: 'Outros' },
								]}
								required
								isInvalid={isRelatesToInvalid}
							/>
						</div>
						<div>
							<label className="block mb-2 pl-2 dark:text-white/70 font-semibold" htmlFor="description">
								Descrição
							</label>
							<RichTextEditor
								value={description}
								onChange={setDescription}
							/>
						</div>
						<div className="flex justify-end gap-4 pt-4">
							<CustomButton
								type="button"
								onClick={handleRegisterProduct}
								disabled={isLoading}
								className={`!bg-red-800 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-red-700 dark:hover:!bg-red-700'}`}
							>
								{isLoading ? 'Registrando...' : 'Registrar'}
							</CustomButton>
						</div>
					</form>
				</Modal>
				<Modal
					isOpen={Boolean(productToDelete)}
					onRequestClose={() => setProductToDelete(null)}
					shouldCloseOnOverlayClick={true}
					overlayClassName="ReactModal__Overlay fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300"
					className={`relative bg-white dark:bg-[#0e1117] dark:backdrop-blur-xl text-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md mx-auto border-t-[6px] transform transition-all duration-300 ease-in-out border-red-800 dark:border-red-600 ${productToDelete ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
				>
					<button
						onClick={() => setProductToDelete(null)}
						className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
					>
						×
					</button>

					<h2 className="text-2xl mb-4 text-center font-bold text-red-800 dark:text-red-600">Confirmar Exclusão</h2>
					<p className="text-center text-sm text-gray-700 dark:text-gray-300 mb-6">
						Tem certeza que deseja excluir o produto <strong>{productToDelete?.title}</strong>?
					</p>

					<div className="flex justify-center">
						<CustomButton
							type="button"
							onClick={() => setProductToDelete(null)}
							className="!bg-gray-500 hover:!bg-gray-600"
						>
							Cancelar
						</CustomButton>
						<CustomButton
							type="button"
							onClick={handleConfirmDelete}
							className={`!bg-red-800 ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-red-700'}`}
							disabled={isDeleting}
						>
							{isDeleting ? 'Excluindo...' : 'Excluir'}
						</CustomButton>
					</div>
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
			<style>{`
				.shadow-bright-red {
					box-shadow: 0 0 18px rgba(255, 0, 0, 0.5);
				}
				.shadow-bright-orange {
					box-shadow: 0 0 18px rgba(255, 165, 0, 0.5);
				}
			`}</style>
		</div>
	);
}

export default withAdminProtection(ProductsPage);