import React, {useState, useEffect}from 'react';
import api from '../../services/api'
import { Container, Owner, Loading, BackButton, IssuesList, PageActions,  FilterList} from './styles';
import { FaArrowLeft } from 'react-icons/fa';
// import { ButtonGroup } from '@material-ui/core';

export default function Repositorio({match}){
  
  // STATES
  const [repositorio, setRepositorio] = useState({}); //objeto porque é apenas um
  const [issues, setIssues] = useState([]); //array porque estou trazendo 5 
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); //amarzenar a página atualmente
  const [filters, setFilters] = useState([
    {state: 'all', label: 'Todas', active: true},
    {state: 'open', label: 'Abertas', active: false},
    {state: 'closed', label: 'Fechadas', active: false},
  ]); 
  const [filterIndex, setFilterIndex] = useState(0)

  useEffect(() => {
    async function load() {
      const nomeRepo = decodeURIComponent(match.params.repositorio)

    //fazendo duas requisões ao mesmo tempo e trazendo dentro de um array
      const [repositorioData, issuesData] = await Promise.all([
        api.get(`/repos/${nomeRepo}`), 
        api.get(`/repos/${nomeRepo}/issues`, {
          params: {
            state: filters.find(f => f.active).state, //pegando issues que está traz active true
            per_page: 5
          }
        })
      ]);
      
      // Atualizando as STATES
      setRepositorio(repositorioData.data);
      setIssues(issuesData.data);
      setLoading(false);
        
      // console.log(issues);
      // console.log(repositorioData.data);
      // console.log(issuesData.data);
       
    }
    load();
  }, [match.params.repositorio]);


  useEffect(() =>{
    async function loadIssue(){
      const nomeRepo = decodeURIComponent(match.params.repositorio);

      const response = await api.get(`/repos/${nomeRepo}/issues`, {
        params: {
          state: filters[filterIndex].state, //filter[0].state
          page,
          per_page: 5,
          
        },
      });

      setIssues(response.data);
      console.log(filterIndex)
    }

    loadIssue()
  }, [ filterIndex, filters, match.params.repositorio, page]);



  function handlePage(action) {
    setPage(action === 'back' ? page -1 : page +1)
  }

  function handFilter(index) {
    setFilterIndex(index)
    
  }


if(loading) {
  return(
    <Loading>
      <h1>Carregando...</h1>
    </Loading>
  )
}

  return(
    <Container>
      <BackButton to="/">
        <FaArrowLeft color="black" size={30}/>
      </BackButton>

      <Owner>
        <img src={repositorio.owner.avatar_url} alt={repositorio.owner.login} />
        <h1>{repositorio.name}</h1>
        <p>{repositorio.description}</p>
      </Owner>

      <FilterList active={filterIndex}>
          {filters.map((filter, index) => (
            <button
              type="button"
              key={filter.label}
              onClick={() => handFilter(index)}
            >
              {filter.label}
            </button>
          ) )}
      </FilterList>

      <IssuesList>
        {issues.map(issue => (
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login}></img>
            
            <div>
              <strong>
                <a href={issue.html_url}>{issue.title}</a>

                {issue.labels.map(label => (
                  <span key={String(label.id)}>{label.name}</span>
                ))}

              </strong>
              <p>{issue.user.login}</p>
            </div>
          </li>
        ))}
      </IssuesList>

      <PageActions>
        <button type="button"
        onClick={() => handlePage('back')}
        disabled={page <2}
        >Voltar</button>
        <button type="button" onClick={() => handlePage('next')}>Próxima</button>
      </PageActions>

    </Container>
  )
}