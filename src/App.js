import React, { Component } from 'react';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import PropTypes from 'prop-types'
import './App.css';

const DEFAULT_PAGE = 0;
const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
}

const updateSearchTopstoriesState = (hits, page) => (prevState) => {
    const { searchKey, results } = prevState;
    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : [];
    const updatedHits = [
      ...oldHits,
      ...hits
    ];
    return {
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
        },
        isLoading: false
    };
  };

class App extends Component {
  constructor(props){
    super(props)

    this.state = {
                  results: null,
                  searchKey: '',
                  searchTerm: DEFAULT_QUERY,
                  isLoading: false, 
                }

    this.onDismiss = this.onDismiss.bind(this)
    this.searchChange = this.searchChange.bind(this)
    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.needsToSearchTopstories = this.needsToSearchTopstories.bind(this);
  }

  onDismiss(id) {
    this.setState(prevState => {
      const { searchKey, results } = prevState;
      const { hits, page } = results[searchKey];
      const isNotId = item => item.objectID !== id;
      const updatedHits = hits.filter(isNotId);

      return {
        results: {
          ...results,
          [searchKey]: { hits: updatedHits, page }
        }
      }
    });
  }
  

  searchChange(event){
    this.setState({ searchTerm: event.target.value })
  }

  setSearchTopstories(result) {
    const { hits, page } = result;

    this.setState(updateSearchTopstoriesState(hits, page));
  }

  needsToSearchTopstories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  fetchSearchTopstories(searchTerm, page) {
    this.setState({isLoading: true})
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`)
      .then(response => response.json())
      .then(result => this.setSearchTopstories(result))
      .catch(e => e);
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    
    if (this.needsToSearchTopstories(searchTerm)) {
      this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
    }

    event.preventDefault();
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
  }

  render() {
    const { searchTerm, results, searchKey, isLoading, } = this.state
    const page = (results && results[searchKey] && results[searchKey].page) || 0
    const list = (results && results[searchKey] && results[searchKey].hits) || [];

    return (
      <div className="page">
        <div className="interactions">   
          <Search onChange={ this.searchChange } value={searchTerm}
            onSubmit={this.onSearchSubmit}> 
            Search
          </Search>
        </div>
        <Table 
          list={list} 
          onDismiss={this.onDismiss}
        />
        <div className="interactions">
          <ButtonWithLoading 
              isLoading = {isLoading}
              onClick={() => this.fetchSearchTopstories(searchKey, page + 1)}>
              More
          </ButtonWithLoading>
        </div>
      </div>
    );
  }
}


class Table extends Component {
  constructor(props){
    super(props)
    this.state = {
      sortKey: 'NONE',
      isSortReverse: false,
    }
    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }

  render(){
    const largeColumn = {
      width: '40%',
    };
    const midColumn = {
      width: '30%',
    };
    const smallColumn = {
      width: '10%',
    };
    const {sortKey, isSortReverse} = this.state;
    const sortedList = SORTS[sortKey](this.props.list);
    const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;
    
    return(
      <div className='table'>
        <div className="table-header">
          <span style={{ width: '40%' }}>
            <Sort sortKey={'TITLE'} onSort={this.onSort} activeSortKey={sortKey}>
              Title
            </Sort>
          </span>
          <span style={{ width: '30%' }}>
            <Sort sortKey={'AUTHOR'} onSort={this.onSort} activeSortKey={sortKey}>
              Author
            </Sort>
          </span>
          <span style={{ width: '10%' }}> 
            <Sort sortKey={'COMMENTS'} onSort={this.onSort} activeSortKey={sortKey}>
              Comments
            </Sort>
          </span>
          <span style={{ width: '10%' }}>
            <Sort sortKey={'POINTS'} onSort={this.onSort} activeSortKey={sortKey}>
              Points
            </Sort>
          </span>
          <span style={{ width: '10%' }}>
            Archive
          </span>
        </div>

          { reverseSortedList.map( item =>
            <div key={item.objectID} className="table-row">
              <span style={largeColumn}>
                <a href={item.url}>{item.title}</a>
              </span> 
              <span style={midColumn}>{item.author}</span>
              <span style={smallColumn}>{item.num_comments}</span>
              <span style={smallColumn}>{item.points}</span>
              <span style={smallColumn}>
                <Button onClick={() => this.props.onDismiss(item.objectID)} className="button-inline"> Dismiss </Button>
              </span>
              <br/>
            </div>
          )}
        </div>
    )
  }
}
Table.PropTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
    objectID: PropTypes.string.isRequired,
    author: PropTypes.string,
    url: PropTypes.string,
    num_comments: PropTypes.number,
    points: PropTypes.number,
    })
    ).isRequired,
  onDismiss: PropTypes.func.isRequired
}

const Sort = ({ sortKey, onSort, children, activeSortKey }) => {
  const sortClass = classNames(
    'button-inline',
    {'button-active': sortKey === activeSortKey}
  )
  return(
    <Button onClick={() => onSort(sortKey)} className={sortClass}>
      {children}
    </Button>
  )
}

const Button = (props) =>{
    const {onClick, className='', children} = props
    return(
      <button onClick={onClick} className={className} type="button">
        {children}
      </button>
    )
}
Button.PropTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
}

const withLoading = (Component) => ({isLoading, ...rest}) =>
  isLoading ? <Loading /> : <Component {...rest} />

const ButtonWithLoading = withLoading(Button)

//destructuring props and removing "{}" to use implicit return
class Search extends Component {
  componentDidMount(){
   this.input.focus();
  }
  render(){
    const {children, onChange, value, onSubmit} = this.props
    return(
      <form onSubmit={onSubmit}>
        <input type="text" onChange={onChange} value={value} ref={(node) => {this.input = node}}/>
        <button type="submit">{children}</button>
      </form>
    )
  }
}
Search.PropTypes ={
  children: PropTypes.node.isRequired, 
  onChange: PropTypes.func.isRequired, 
  value: PropTypes.string.isRequired, 
  onSubmit: PropTypes.func.isRequired
} 


const Loading = () => 
  <div>
    <i className="fa fa-spinner fa-spin fa-3x fa-fw"></i>
    <span >Loading...</span>
  </div>





export default App;

export {
  Button,
  Search,
  Table
}


// ES6
//const isSearched = (searchTerm) => (item) =>
//!searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());


