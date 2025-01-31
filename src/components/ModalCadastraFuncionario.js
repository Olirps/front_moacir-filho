import React, { useState, useEffect } from 'react';
import '../styles/ModalCadastraFuncionario.css';
import { cpfCnpjMask } from './utils';
import { formatarCelular } from '../utils/functions';
import { getUfs, getMunicipiosUfId } from '../services/api';
import Toast from '../components/Toast';

function ModalFuncionario({ isOpen, onClose, onSubmit, funcionario, edit }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [tipoFuncionario, settipoFuncionario] = useState('');
  const [dataContratacao, setdataContratacao] = useState('');
  const [cargo, setCargo] = useState('');
  const [salario, setSalario] = useState('');
  const [logradouro, setLogradouro] = useState('');

  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [uf, setUf] = useState('');
  const [cep, setCep] = useState('');
  const [ufs, setUfs] = useState([]); // Estado para armazenar os UFs
  const [municipios, setMunicipios] = useState([]); // Estado para armazenar os municípios
  const [toast, setToast] = useState({ message: '', type: '' });

  // Carregar dados do funcionário quando o modal for aberto
  useEffect(() => {
    if (isOpen) {
      const preencherDadosFuncionario = async () => {
        if (funcionario && edit) {
          setNome(funcionario.cliente?.nome || '');
          setCpf(funcionario.cliente?.cpfCnpj || '');
          setEmail(funcionario.cliente?.email || '');
          setCelular(funcionario.cliente?.celular || '');
          setdataContratacao(funcionario.dataContratacao || '');
          settipoFuncionario(funcionario.tipoFuncionario || '');
          setCargo(funcionario.cargo || '');
          setSalario(funcionario.salario || '');
          setLogradouro(funcionario.cliente?.logradouro || '');
          setNumero(funcionario.cliente?.numero || '');
          setBairro(funcionario.cliente?.bairro || '');
          setCep(funcionario.cliente?.cep || '');

          if (funcionario.cliente.uf_id) {
            const ufCorrespondente = ufs.find((uf) => parseInt(uf.codIBGE) === parseInt(funcionario.cliente.uf_id));
            setUf(ufCorrespondente ? ufCorrespondente.codIBGE : '');
          }

          if (funcionario.cliente.municipio_id) {
            const municipioCorrespondente = municipios.find((municipio) => municipio.id === funcionario.cliente.municipio_id);
            setMunicipio(municipioCorrespondente ? municipioCorrespondente.id : '');
          }
        }
      };

      preencherDadosFuncionario();
    } else {
      // Resetar campos somente quando o modal é fechado
      setNome('');
      setCpf('');
      setEmail('');
      setCelular('');
      setdataContratacao('');
      settipoFuncionario('');
      setCargo('');
      setSalario('');
      setLogradouro('');
      setNumero('');
      setBairro('');
      setMunicipio('');
      setUf('');
      setCep('');
    }
  }, [isOpen, funcionario, edit, ufs, municipios]);


  //ufs, municipios
  // Carregar UFs e municípios quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      const fetchUfs = async () => {
        try {
          let munsUf;
          const ufsData = await getUfs(); // Supõe-se que isso retorna o JSON fornecido

          if (edit && funcionario) {
            munsUf = await getMunicipiosUfId(funcionario.cliente.uf_id);
          }

          if (Array.isArray(ufsData.data)) {
            setUfs(ufsData.data);
          } else {
            console.error("O retorno de getUfs não é um array:", JSON.stringify(ufsData.data));
          }

          if (edit && Array.isArray(munsUf.data)) {
            setMunicipios(munsUf.data);
          }
        } catch (error) {
          console.error("Erro ao buscar UFs:", error);
          setUfs([]); // Define como um array vazio em caso de erro

          // Adicionando o toast de erro
          setToast({
            message: "Erro ao buscar as UFs. Tente novamente.",
            type: "error", // Tipo de mensagem: pode ser "success", "error", etc.
            duration: 3000, // Duração do toast em milissegundos
          });
        }
      };

      fetchUfs();
    }
  }, [isOpen, edit, funcionario]);

  // Função para lidar com mudança de UF
  const handleUfChange = async (e) => {
    const selectedUf = e.target.value;
    setUf(selectedUf);
    if (selectedUf) {
      try {
        const municipiosData = await getMunicipiosUfId(selectedUf);
        if (Array.isArray(municipiosData.data)) {
          setMunicipios(municipiosData.data);
        } else {
          setMunicipios([]); // Resetar em caso de erro
        }
      } catch (error) {
        setMunicipios([]);
      }
    } else {
      setMunicipios([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>X</button>
        <h2>{edit ? 'Editar Funcionário' : 'Cadastrar Funcionário'}</h2>
        <form onSubmit={onSubmit}>
          <div id='cadastro-padrao'>
            <div>
              <label htmlFor="nome">Nome</label>
              <input
                className='input-geral'
                type="text"
                id='nome'
                name="nome"
                value={nome.toUpperCase()}
                onChange={(e) => setNome(e.target.value)}
                maxLength={150}
                required
              />
            </div>
            <div>
              <label htmlFor="cpf">CPF</label>
              <input
                className='input-geral'
                type="text"
                id='cpf'
                name="cpf"
                value={cpfCnpjMask(cpf)}
                onChange={(e) => setCpf(cpfCnpjMask(e.target.value))}
                disabled={edit}
                required
              />
              {edit && <input type="hidden" name="cpf" value={cpf} />}

            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                className='input-geral'
                type="email"
                id='email'
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <label htmlFor="celular">Celular</label>
              <input
                className='input-geral'
                type="text"
                id='celular'
                name="celular"
                value={formatarCelular(celular)}
                onChange={(e) => setCelular(e.target.value)}
                maxLength={20}
                required
              />
            </div>
            <div>
              <label htmlFor="dataContratacao">Data Contratação</label>
              <input
                className='input-geral'
                type="text"
                id='dataContratacao'
                name="dataContratacao"
                value={dataContratacao}
                onChange={(e) => setdataContratacao(e.target.value)}
                maxLength={10}
                required
              />
            </div>
            <div>
              <label htmlFor="tipoFuncionario">Tipo de Funcionário</label>
              <select
                className='input-geral'
                id='tipoFuncionario'
                name="tipoFuncionario"
                value={tipoFuncionario}
                onChange={(e) => settipoFuncionario(e.target.value)}
                required
              >
                <option value="">Selecione</option>
                <option value="administrativo">Administrativo</option>
                <option value="servico">Serviço</option>
                <option value="gestao">Gestão</option>
              </select>
            </div>
            <div>
              <label htmlFor="cargo">Cargo</label>
              <input
                className='input-geral'
                type="text"
                id='cargo'
                name="cargo"
                value={cargo.toUpperCase()}
                onChange={(e) => setCargo(e.target.value)}
                maxLength={50}
                required
              />
            </div>
            <div>
              <label htmlFor="salario">Salário</label>
              <input
                className='input-geral'
                type="text"
                id='salario'
                name="salario"
                value={salario}
                onChange={(e) => setSalario(e.target.value.replace(',', '.'))}
                maxLength={12}
                required
              />
            </div>
            <div>
              <label htmlFor="logradouro">Endereço</label>
              <input
                className='input-geral'
                type="text"
                id='logradouro'
                name="logradouro"
                value={logradouro.toUpperCase()}
                maxLength={100}
                onChange={(e) => setLogradouro(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="numero">Número</label>
              <input
                className='input-geral'
                type="text"
                id="numero"
                name="numero"
                value={numero}
                onChange={(e) => { setNumero(e.target.value) }}
                maxLength={8}
                required
              />
            </div>
            <div>
              <label htmlFor="bairro">Bairro</label>
              <input
                className='input-geral'
                type="text"
                id="bairro"
                name="bairro"
                value={bairro.toUpperCase()}
                onChange={(e) => { setBairro(e.target.value) }}
                maxLength={100}
                required
              />
            </div>
            <div>
              <label htmlFor="cep">CEP</label>
              <input
                className='input-geral'
                type="text"
                id="cep"
                name="cep"
                value={cep}
                onChange={(e) => { setCep(e.target.value) }}
                maxLength={9}
                required
              />
            </div>
            <div>
              <label htmlFor="uf">UF</label>
              <select
                className="input-geral"
                id="uf"
                name="uf"
                value={uf}
                onChange={handleUfChange}
                required
              >
                <option value="">Selecione um estado</option>
                {ufs.map((uf) => (
                  <option key={uf.id} value={uf.codIBGE}>
                    {uf.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="municipio">Município</label>
              <select
                className="input-geral"
                id="municipio"
                name="municipio"
                value={municipio}
                onChange={(e) => { setMunicipio(e.target.value) }}
                required
              >
                <option value="">Selecione um município</option>
                {Array.isArray(municipios) &&
                  municipios.map((mun) => (
                    <option key={mun.id} value={mun.id}>
                      {mun.nome}
                    </option>
                  ))
                }
              </select>
            </div>
            <div id='botao-salva'>
              <button id="btnsalvar" className="button" type="submit">Salvar</button>
            </div>
          </div>
        </form>
      </div>
      {toast.message && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}
    </div>
  );
}

export default ModalFuncionario;
