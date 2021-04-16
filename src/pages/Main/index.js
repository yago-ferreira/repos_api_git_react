import React, { useState , useCallback , useEffect} from 'react';
import { FaGithub, FaPlus, FaSpinner, FaBars, FaTrash} from 'react-icons/fa';
import {Container, Form, SubmitButton, List, DeleteButton} from './styles';
import {Link} from 'react-router-dom';
// import './estilo.css';
// import CircularProgress from '@material-ui/core/CircularProgress';
import api from '../../services/api';

export default function Main(){

  const [newRepo, setNewRepo] = useState('');
  const [repositorios, setRepositorios] = useState([]);
  const [loading, setLoading] = useState(false); //criei um novo estado para saber quando está em loading, começando como false, ele só irá habilitar essa animação quando clicar no botão.
  const [alert, setAlert] = useState(null);


  //DidMount -> Buscar
 useEffect(() =>{
    const repoStorage = localStorage.getItem('repos');

    if(repoStorage){
      setRepositorios(JSON.parse(repoStorage));
    }

 }, []);

  //DidUpdate -> Salvar Alterações 
  useEffect(() => {
    localStorage.setItem('repos', JSON.stringify(repositorios));
  }, [repositorios]);


  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    async function submit(){
      setAlert(null);
      setLoading(true);  //clicou no handleSubmit, vai chamar o submit e habilita loading
        //joguei dentro de um try cath para controlar quando ele vai na requisição e quando ele acaba e podendo capturar um erro.
      try{

        if(newRepo === '') {
          throw new Error('Você precisa indicar um repositorio!');
        }

        const response = await api.get(`repos/${newRepo}`)

        const hasRepo = repositorios.find(repo => repo.name === newRepo) //verifica se o repositorio é igual ao digitado no input

        if(hasRepo) {
          throw new Error('Repositorio Duplicado');
        }

        const data = {
          name: response.data.full_name,
    
        }
    
        setRepositorios([...repositorios, data])
        setNewRepo('')
      } catch(error) {
        setAlert(true)
        console.log(error);
      } finally{
        setLoading(false); //Quando chegar aqui é porque deu tudo certo, cancelando o loading
      }
      
    }

    submit();

  }, [newRepo, repositorios]);

  

  function handleinputChange(e){
    setNewRepo(e.target.value);
    setAlert(null);
  }

  const handleDelete = useCallback ((repo) => {
    const find = repositorios.filter(r => r.name !== repo) // retorna td que tinha dentro de repositorios, menos o que clicamos, fazendo um filtro.
    setRepositorios(find);
  }, [repositorios]);

  return(
    <Container>
      
      <h1>
        <FaGithub size={25}/>
        Meus Repositorios
      </h1>

      <Form onSubmit={handleSubmit} error={alert}>
        <input 
        type="text" 
        placeholder="Adicionar Repositorios"
        value={newRepo}
        onChange={handleinputChange}
        />
        
        <SubmitButton loading={loading ? 1 : 0}> {/*se for true, a gente mostra 1 se não mostra 0 para styled components  */}
        
          {loading ? ( //se loading for true
            <FaSpinner color="#FFF" size={14} />
          ): // se não 
            <FaPlus color="#FFF" size={15} />
          }
        </SubmitButton>

      </Form>

      <List>
        {repositorios.map(repo =>(
          <li key={repo.name}>
            <span>
              <DeleteButton onClick={() => handleDelete(repo.name)}>
                <FaTrash size={14} />
              </DeleteButton>
              {repo.name}
            </span>
            <Link to={`/repositorio/${encodeURIComponent(repo.name)}`}>
              <FaBars size={20} />
            </Link>
          </li>
        ))}
      </List>

    </Container>
  )
}
