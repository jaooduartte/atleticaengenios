import { useState, useEffect } from 'react';
import { CameraIcon, EyeIcon, EyeSlashIcon, UserCircleIcon, LockIcon, GenderIntersexIcon, StudentIcon, InstagramLogoIcon, PhoneIcon } from '@phosphor-icons/react'
import Image from 'next/image';
import CustomField from '../components/custom-field';
import CustomButton from '../components/custom-buttom';
import Cropper from 'react-easy-crop';
import Modal from 'react-modal';
import Header from '../components/header';
import Footer from '../components/footer';
import CustomDropdown from '../components/custom-dropdown';
import Banner from '../components/banner';
import PasswordRequirements from '../components/password-requirements';
import Head from 'next/head';
import withAuth from '../utils/withAuth';
import Loading from '../components/Loading';

function MyAccount() {
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    sex: '',
    phone: '',
    instagram: '',
    modalities: [],
    password: '',
    photo: '',
  });
  const [isCropping, setIsCropping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bannerType, setBannerType] = useState('');
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        setIsFetching(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setFormData({
            name: data.user.name || '',
            course: data.user.course || '',
            sex: data.user.sex || '',
            phone: data.user.phone || '',
            instagram: data.user.instagram || '',
            modalities: (() => {
              if (Array.isArray(data.user.modalities)) return data.user.modalities;
              if (typeof data.user.modalities === 'string') {
                return parsePostgresArray(data.user.modalities);
              }
              return [];
            })(),
            password: '',
            photo: data.user.photo || '/placeholder.png'
          });
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const parsePostgresArray = (str) => {
    if (!str) return [];
    return str
      .slice(1, -1)
      .split(',')
      .map(s => s.trim().replace(/(^"|"$)/g, ''));
  };

  const showBannerMessage = (message, type, description = '') => {
    setBannerMessage(message);
    setBannerDescription(description);
    setBannerType(type);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 4500);
  };

  const capitalizeName = (name) => {
    return name
      .split(' ')
      .map((word) => {
        if (word.length > 2) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        } else {
          return word.toLowerCase();
        }
      })
      .join(' ');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    let { value } = e.target;
    value = value.replace(/\D/g, '').slice(0, 11);

    let formatted = value;

    if (value.length > 0) formatted = `(${value.slice(0, 2)}`;
    if (value.length >= 3) formatted += `) ${value.slice(2, 7)}`;
    if (value.length >= 8) formatted += `-${value.slice(7, 11)}`;

    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        localStorage.setItem('user', JSON.stringify({ ...formData }));

        showBannerMessage('Perfil atualizado com sucesso!', 'success', 'As alterações foram salvas corretamente.');
        setTimeout(() => {
          window.location.href = '/home';
          setIsSaving(false);
        }, 1000);
        return;
      } else {
        showBannerMessage('Erro ao atualizar perfil.', 'error');
        setIsSaving(false);
        return;
      }
    } catch (err) {
      console.error(err);
      showBannerMessage('Erro de conexão com o servidor', 'error');
      setIsSaving(false);
      return;
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModalityChange = (modality, checked) => {
    setFormData(prev => {
      const current = Array.isArray(prev.modalities) ? prev.modalities : [];
      return {
        ...prev,
        modalities: checked
          ? [...current, modality]
          : current.filter(m => m !== modality)
      };
    });
  };

  const cropComplete = () => {
  };

  const applyCrop = () => {
    setFormData(prev => ({ ...prev, photo: selectedImage }));
    setIsCropping(false);
  };

  if (isFetching) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>Minha Conta</title>
      </Head>

      <div className="flex flex-col bg-white text-black dark:bg-[#0e1117] dark:text-white min-h-screen transition-colors duration-500 ease-in-out">
        <Header />
        {showBanner && (
          <Banner
            message={bannerMessage}
            description={bannerDescription}
            type={bannerType}
          />
        )}
        <main className="flex-grow p-8 w-full mx-auto transition-colors duration-500 ease-in-out">
          <h1 className="text-5xl font-bold mb-10 mt-4 text-center text-gray-800 dark:text-white">Minha Conta</h1>

          <div className="flex justify-center mb-8">
            <div className="relative group w-20 h-20">
              {formData.photo && (
                <Image
                  src={formData.photo}
                  alt="Foto de perfil"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover shadow-md"
                />)
              }

              <label
                htmlFor="profilePhoto"
                className="absolute inset-0 backdrop-blur-sm bg-white/40 dark:bg-[#0e1117]/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <CameraIcon size={28} className="text-[#B3090F]" />
                <input
                  id="profilePhoto"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  hidden
                />
              </label>
            </div>
          </div>

          <div className="justify-center flex flex-col ml-10 mr-10 md:flex-row gap-8">
            <section className="flex-1 shadow-lg dark:shadow-none rounded-xl space-y-6 p-8 w-full max-w-md md:max-w-sm">
              <h2 className="text-2xl font-bold text-center mb-4">Informações Pessoais</h2>
              <div className="space-y-6">
                <div className="max-w-sm mx-auto">
                  <CustomField
                    icon={UserCircleIcon}
                    name="name"
                    placeholder="Nome completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={(e) => setFormData(prev => ({ ...prev, name: capitalizeName(e.target.value) }))}
                    autoComplete="name"
                  />
                </div>
                <div className="max-w-sm mx-auto">
                  <CustomDropdown
                    icon={StudentIcon}
                    value={formData.course}
                    onChange={(value) => setFormData(prev => ({ ...prev, course: value }))}
                    options={[
                      'Engenharia de Software',
                      'Engenharia Civil',
                      'Engenharia de Produção',
                      'Engenharia Elétrica',
                      'Engenharia Mecânica',
                      'Arquitetura'
                    ]}
                    placeholder="Selecione o curso"
                  />
                </div>
                <div className="max-w-sm mx-auto">
                  <CustomDropdown
                    icon={GenderIntersexIcon}
                    value={formData.sex}
                    onChange={(value) => setFormData(prev => ({ ...prev, sex: value }))}
                    options={['Masculino', 'Feminino', 'Outro']}
                    placeholder="Selecione o sexo"
                  />
                </div>
                <div className="max-w-sm mx-auto">
                  <CustomField
                    icon={PhoneIcon}
                    name="phone"
                    placeholder="Telefone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                  />
                </div>
                <div className="max-w-sm mx-auto">
                  <CustomField
                    icon={InstagramLogoIcon}
                    name="instagram"
                    placeholder="usuario"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    prefix="@"
                  />
                </div>
              </div>
            </section>
            <section className="flex-1 shadow-lg dark:shadow-none rounded-xl space-y-6 p-8 w-full max-w-md md:max-w-sm">
              <h2 className="text-2xl font-bold text-center mb-4">Alterar Senha</h2>
              <div className="space-y-6">
                <div className="max-w-sm mx-auto relative">
                  <CustomField
                    icon={LockIcon}
                    name="password"
                    placeholder="Nova senha"
                    value={formData.password}
                    onChange={handleInputChange}
                    type={showPassword ? 'text' : 'password'}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeIcon size={20} /> : <EyeSlashIcon size={20} />}
                  </button>
                </div>
                <div className="max-w-sm mx-auto relative">
                  <CustomField
                    icon={LockIcon}
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeIcon size={20} /> : <EyeSlashIcon size={20} />}
                  </button>
                </div>
                <PasswordRequirements
                  password={formData.password}
                  confirmPassword={confirmPassword}
                />
              </div>
              <div className="flex justify-end">
              </div>
            </section>
            <section className="flex-1 shadow-lg dark:shadow-none rounded-xl space-y-6 p-8 w-full max-w-md md:max-w-sm">
              <h2 className="text-2xl font-bold text-center mb-4">Modalidades Preferidas</h2>
              <div className="grid grid-cols-2 gap-2">
                {['Atletistmo', 'Basquete', 'BeachSoccer', 'BeachTenis', 'FIFA', 'Fut7', 'Futvolei', 'Futsal', 'Handebol', 'Judô', 'Natação', 'Volei', 'Volei de Areia', 'Xadrez'].map((modality) => (
                  <label key={modality} className="flex items-center space-x-2 mb-1">
                    <input
                      type="checkbox"
                      checked={formData.modalities.includes(modality)}
                      onChange={(e) => handleModalityChange(modality, e.target.checked)}
                      className="accent-[#B3090F] focus:ring-[#B3090F] text-[#B3090F]"
                    />
                    <span>{modality}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>
          <CustomButton
            className={`!bg-[#B3090F] dark:!bg-[#B3090F]/70 ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-red-600 dark:hover:!bg-red-600/70'} mt-10`}
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </CustomButton>

          <Modal
            isOpen={isCropping}
            onRequestClose={() => setIsCropping(false)}
            className="bg-white dark:bg-[#0e1117] p-6 rounded-xl max-w-xl mx-auto mt-20 shadow-lg"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[999]"
          >
            <div className="relative w-full h-96 bg-gray-200 dark:bg-[#23272f]">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                cropShape="round"
                aspect={1}
                showGrid={false}
                objectFit="horizontal-cover"
                onCropChange={setCrop}
                onCropComplete={cropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <CustomButton className="!bg-gray-400 hover:!bg-gray-500 mt-5 dark:!bg-white/10 dark:hover:!bg-white/20 dark:text-white" onClick={() => setIsCropping(false)}>Cancelar</CustomButton>
              <CustomButton className="!bg-[#B3090F] hover:!bg-red-600 mt-5" onClick={applyCrop}>Aplicar</CustomButton>
            </div>
          </Modal>
        </main>
        <Footer />
      </div>
    </>
  );
}
export default withAuth(MyAccount);