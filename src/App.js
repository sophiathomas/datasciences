import React, { Component } from 'react';
import './App.css';
import validate from 'validate.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();

    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getInitialState = this.getInitialState.bind(this);
  }

  getInitialState = () => {
    return {
      inputs: {
        name: '',
        email: '',
        postalCode: '',
        consent: false,
      }
    };
  }
  
  handleTextChange = event => {
    const name = event.target.name;
    const value = event.target.value;

    this.setState({ 
      inputs: {
        ...this.state.inputs, [name]: value 
      } 
    });
  }

  handleCheckboxChange = event => {
    const name = event.target.name;
    const checked = event.target.checked ? true : false;
    
    this.setState({
      inputs: {
        ...this.state.inputs, [name]: checked
      }
    });
  }

  handleSubmit = event => {
    event.preventDefault(); 
    
    const inputs = event.target.elements;
    const info = this.state.inputs;
    const errors = getErrors(info);

    //reset errors
    Object.entries(inputs).forEach( ([key, input]) => {
      input.classList.remove('error');
    });

    if(errors) {
      // display error to client
      Object.entries(errors).forEach( ([inputName, message]) => {
        inputs[inputName].classList.add('error');
      });
      return; 
    } else { 
      
      // async fetch to disable double submition
      fetch('https://webhook.site/bdf2b2f6-c540-4b0b-b424-2a99f5e3b66f', {
        method: 'POST',
        mode: 'no-cors',
        body: info,
      })
      .then(data => {
        console.log('Success:', data);

        // confirm to client
        document.getElementById('signup').value = "Thanks for signing up";
        
      })
      .catch(error => {
        console.error('Error:', error);

        // something went wrong, please refresh the page
        document.getElementById('signup').value = "A problem occurred, please try again";
      })
      .finally( () => {
        setTimeout(this.resetForm, 2000);
      });
    }
  }

  displayErrors = errors => {
    // todo ^^
  }

  resetForm = () => {
    document.getElementById('signup').value = "Submit";
    this.setState(this.getInitialState());
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="text" name="name" value={this.state.inputs.name} onChange={this.handleTextChange} required />
        </label>
        <label>
          Email:
          <input type="email" name="email" value={this.state.inputs.email} onChange={this.handleTextChange} required />
        </label>
        <label>
          Postal Code:
          <input type="text" name="postalCode" value={this.state.inputs.postal} onChange={this.handleTextChange} required />
        </label>
        <label>
          <input type="checkbox" name="consent" value={this.state.inputs.consent} onChange={this.handleCheckboxChange} required />
           I have read and agreed to the terms and conditions.
        </label>
        <input type="submit" id="signup" value="Submit" />
      </form>
    );
  }
}

const constraints = {
  name: {
    presence: {allowEmpty: false},
  },
  email: {
    presence: {allowEmpty: false},
    email: {
      message: "Please enter a valid email"
    }
  },
  postalCode: {
    presence: {allowEmpty: false},
    format: {
      pattern: /^(?:[A-Z]\d[A-Z][ -]?\d[A-Z]\d)$/i,
      flags: "i",
      message: "Please enter a valid Canadian postal code"
    }
  },
  consent: {
    presence: true,
    inclusion: {
      within: [true],
      message: "Please check the box to accept the terms and conditions"
    }
  }
}

function getErrors(data) {
  return validate(data, constraints);
}

export default App;
