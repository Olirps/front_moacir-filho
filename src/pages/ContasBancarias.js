import React, { useState, useEffect } from 'react';
import { addContabancaria, getAllContas } from '../services/api';
import ModalCadastroContasBancarias from '../components/ModalCadastroContasBancarias';
import Toast from '../components/Toast';

const ContasBancarias = () => {
    const [contas, setContas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: '' });


    useEffect(() => {
        const fetchContas = async () => {
            try {
                const response = await getAllContas();
                setContas(response.length > 0 ? response : []);
            } catch (error) {
                console.error('Erro ao buscar contas bancárias:', error);
                setContas([]);
            } finally {
                setLoading(false);
            }
        };
        fetchContas();
    }, []);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleAddContaBancaria = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newConta = {
            banco_id: formData.get('bancoId'),
            agencia: formData.get('agencia'),
            conta: formData.get('numero'),
            nome: formData.get('nome'),
            tipo_conta: formData.get('tipoconta')
        };

        try {
            await addContabancaria(newConta);
            setToast({ message: "Conta Bancária cadastrado com sucesso!", type: "success" });
            setIsModalOpen(false);
            const response = await getAllContas();
            setContas(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Erro ao cadastrar veículo.";
            setToast({ message: errorMessage, type: "error" });
        }
    };
    /*
    const handleEditClick = async (carro) => {
        try {
            const response = await getVeiculosById(carro.id);
            setSelectedCarro(response.data);
            setIsEdit(true);
            setIsModalOpen(true);
        } catch (err) {
            console.error('Erro ao buscar detalhes do veículo', err);
            setToast({ message: "Erro ao buscar detalhes do veículo.", type: "error" });
        }
    };


    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updatedCarro = {
            modelo: formData.get('modelo'),
            placa: formData.get('placa'),
            quilometragem: formData.get('quilometragem'),
            marcaId: formData.get('marcaId'),
            tipoveiculoId: formData.get('tipoVeiculoId')
        };

        try {
            await updateVeiculos(selectedCarro.id, updatedCarro);
            setToast({ message: "Veículo atualizado com sucesso!", type: "success" });
            setIsModalOpen(false);
            setSelectedCarro(null);
            setIsEdit(false);
            const response = await getVeiculos();
            setCarros(response.data);
            setFilteredCarros(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Erro ao atualizar veículo.";
            setToast({ message: errorMessage, type: "error" });
        }
    };
*/
    return (
        <div id="contas-container">
            <h1 className='title-page'>Contas Bancárias</h1>
            <div id="search-container">
                <div id="button-group">
                    <button onClick={handleOpenModal} className="button">Cadastrar Conta</button>
                </div>
            </div>
            <div id="separator-bar"></div>
            <div id="results-container">
                {loading ? (
                    <div className="spinner-container">
                        <div className="spinner"></div>
                    </div>
                ) : contas.length === 0 ? (
                    <p className="empty-message">Nenhuma conta bancária cadastrada.</p>
                ) : (
                    <div id="grid-padrao-container">
                        <table id="grid-padrao">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Banco</th>
                                    <th>Agência</th>
                                    <th>Conta</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contas.map((conta) => (
                                    <tr key={conta.id}>
                                        <td>{conta.id}</td>
                                        <td>{conta.nome}</td>
                                        <td>{conta.agencia}</td>
                                        <td>{conta.numero}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {isModalOpen && (
                <ModalCadastroContasBancarias
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleAddContaBancaria}

                />
            )}
        </div>
    );
};

export default ContasBancarias;
