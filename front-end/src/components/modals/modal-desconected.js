import Modal from 'react-modal';
import React from 'react';
import CustomButton from '../custom-buttom';

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  Modal.setAppElement('#__next');
}

export default function ModalDesconected({ isOpen, onConfirm }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onConfirm}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-lg mx-auto mt-20 shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[999]"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Sessão Expirada
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Sua sessão foi encerrada por inatividade. Você será redirecionado para a tela de login.
        </p>
        <CustomButton
          className="!bg-[#B3090F] hover:!bg-red-600 mt-5"
          onClick={onConfirm}
        >
          OK
        </CustomButton>
      </div>
    </Modal>
  );
}