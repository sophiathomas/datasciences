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
    this.resetForm = this.resetForm.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  getInitialState = () => {
    return {
      data: {
        name: '',
        email: '',
        postalCode: '',
        consent: false,
      },
      inputs: {
        consent: {
          value: "I agree",
        },
        submit: {
          value: "Submit",
        }
      },
      errors: false
    };
  }

  resetForm = () => {
    this.setState(this.getInitialState());
  }
  
  handleTextChange = event => {
    const name = event.target.name;
    const value = event.target.value;

    this.setState({ 
      data: {
        ...this.state.data, [name]: value 
      } 
    });
  }

  handleCheckboxChange = event => {
    const name = event.target.name;
    const checked = event.target.checked ? true : false;
    
    this.setState({
      data: {
        ...this.state.data, [name]: checked
      }
    });
  }

  validateForm = data => {
    try {
      return new Promise((resolve, reject) => {
        // Updating the state displays the errors on the form
        this.setState({
          errors: (getErrors(data) || false),
        },() => resolve(!this.state.errors));
      });
    } catch(e) {
      // @TODO: Do something better here
      console.log(e);
    }
  }

  handleSubmit = async event => {
    event.preventDefault();

    let isValid = await this.validateForm(this.state.data);

    if(isValid) {
      const info = this.state.data;
      alert(JSON.stringify(info));

      // async fetch to disable double submition
      fetch("https://webhook.site/bdf2b2f6-c540-4b0b-b424-2a99f5e3b66f", {
        method: "POST",
        mode: "cors",
        body: info,
      })
      .then(function(response) {
        return response.text();
      })
      .then(data => {
        console.log("Success:", data);

        // confirm to client
        // @TODO: Update the div form to display a nice confirmation
        this.setState({
          inputs: {
            ...this.state.inputs, "submit": { value: "Thanks for signing up"}
          }
        });
        
      })
      .catch(error => {
        console.error("Error:", error);

        // something went wrong
        this.setState({
          inputs: {
            ...this.state.inputs, "submit": { value: "A problem occurred, please try again"}
          }
        });
      })
      .finally( () => {
        setTimeout(this.resetForm, 3000);
      });
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input className={this.state.errors.name ? 'error': null} type="text" name="name" value={this.state.data.name} onChange={this.handleTextChange} required />
        </label>
        {this.state.errors.name && 
          this.state.errors.name.map((message, index, array) => {
            return <span key={index}>{message}</span>;
          })
        }
       
        <label>
          Email:
          <input className={this.state.errors.email ? 'error': null} type="email" name="email" value={this.state.data.email} onChange={this.handleTextChange} required />
        </label>
        {this.state.errors.email && 
          this.state.errors.email.map((message, index, array) => {
            return <span key={index}>{message}</span>;
          })
        }

        <label>
          Postal Code:
          <input className={this.state.errors.postalCode ? 'error': null} type="text" name="postalCode" value={this.state.data.postalCode} onChange={this.handleTextChange} required />
        </label>
        {this.state.errors.postalCode && 
          this.state.errors.postalCode.map((message, index, array) => {
            return <span key={index}>{message}</span>;
          })
        }

        <label>
          <input className={this.state.errors.consent ? 'error': null} type="checkbox" name="consent" value={this.state.inputs.consent.value} checked={this.state.data.consent} onChange={this.handleCheckboxChange} required /> I have read and agreed to the terms and conditions.
        </label>
        <input type="submit" id="signup" value={this.state.inputs.submit.value} />
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
      message: "^Please enter a valid email"
    }
  },
  postalCode: {
    presence: {allowEmpty: false},
    format: {
      pattern: /^(?:[A-Z]\d[A-Z][ -]?\d[A-Z]\d)$/i,
      flags: "i",
      message: "^Please enter a valid Canadian postal code"
    }
  },
  consent: {
    presence: true,
    inclusion: {
      within: [true],
      message: "^Please check the box to accept the terms and conditions"
    }
  }
}

function getErrors(data) {
  return validate(data, constraints);
}

export default App;
