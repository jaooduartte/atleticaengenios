import Header from '../../components/header-admin';
import Footer from '../../components/footer-admin';

function Admin() {
  return (
    <div>
      {/* Cabeçalho */}
      <Header />

      <div className="flex dark:bg-gray-800 justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#B3090F]">Bem-vindo à Área Admin</h1>
          <p className="mt-4 dark:text-white text-lg">Aqui você pode gerenciar tudo de sua atlética!</p>
        </div>
      </div>

      {/* Rodapé */}
      <Footer />
    </div>
  );
}

import withAdminProtection from '../../utils/withAdminProtection';
export default withAdminProtection(Admin);