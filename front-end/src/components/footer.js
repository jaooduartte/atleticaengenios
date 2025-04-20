import { InstagramLogo, Envelope, EnvelopeSimple } from 'phosphor-react';  // Importe os ícones necessários
import Link from 'next/link';  // Importe o Link

export default function Footer() {
  return (
    <footer className="bg-[#B3090F] text-white py-6">
      <div className="flex justify-center space-x-6">
        {/* Ícones das redes sociais */}
        <Link href="https://www.instagram.com/atleticaengenios" target="_blank">
          <InstagramLogo size={30} className="hover:text-red-500 transform hover:scale-110 transition duration-300" />
        </Link>
        <Link href="mailto:atleticaengenios@gmail.com" target="_blank">
          <EnvelopeSimple size={30} className="hover:text-red-500 transform hover:scale-110 transition duration-300" />
        </Link>
      </div>
      <div className="text-center mt-4">
        <p>&copy; 2025 Atletica Engênios - Todos os direitos reservados</p>
      </div>
    </footer>
  );
}