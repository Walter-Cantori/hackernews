import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer'
import {shallow, mount} from 'enzyme' 

import chai, { expect as chaiExpect } from 'chai';
import chaiEnzyme from 'chai-enzyme';
import sinon from 'sinon';

import App, {Search, Button, Table} from './App';

chai.use(chaiEnzyme());
const clickSpy = sinon.spy();

describe('App', ()=> {

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
  });

  test('snapshots', ()=>{
    const component = renderer.create(<App />)
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

})

describe('Search', ()=> {

  const props = {
    children: "Search Text",
    value: "test value",
    onChange: sinon.spy(),
    onSubmit: sinon.spy()
  }

  it('renders', ()=> {
    const div = document.createElement('div')
    ReactDOM.render(<Search>Search</Search>, div)
  })

  const component = shallow(<Search {...props} />)
  it('should have children props', () => {
    chaiExpect(component.find('button').html()).to.equal('<button type="submit">Search Text</button>')
  })

  it('should have value props', () => {
    chaiExpect(component.find('input')).to.have.value("test value")
  })

  it('should submit', ()=> {
    component.find('form').simulate('submit')
    chaiExpect(sinon.spy()).to.have.property('callCount', 1)
  })

  test('Snapshot', () => {
    const component = renderer.create(<Search>Search</Search>)
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

})

describe('Button', ()=> {
  it('renders', () => {
    const div = document.createElement('div')
    ReactDOM.render(<Button>More</Button>, div)
  })

  test('snapshots', () => {
    const component = renderer.create(<Button>More</Button>)
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('Table', () => {

  const props = {
    list: [
        { title: '1', author: '1', num_comments: 1, points: 2, objectID: 'y' },
        { title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z' },
      ]
    }

  it('renders', () => {
    const div = document.createElement('div')
    ReactDOM.render(<Table {...props} />, div)
  })

  it('shows two items in list', () => {
    const element = shallow( <Table { ...props } /> );
    expect(element.find('.table-row').length).toBe(2);
  });

  test('Snapshots', () => {
    const component = renderer.create(<Table {...props} />)
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

})
