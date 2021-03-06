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
      errors: false,
      mode: false
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
      const payload = JSON.stringify(info);

      const endpoint = "https://webhook.site/bdf2b2f6-c540-4b0b-b424-2a99f5e3b66f";
      const proxy = "https://cors-anywhere.herokuapp.com/";
      const query = proxy + endpoint;

      fetch(query, {
        method: "POST",
        mode: "cors",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload,
      })
      .then(function(response) {
        return response.text();
      })
      .then(data => {
        console.log("Success:", data);
        // @TODO: Update the div form to display a nice confirmation
        this.setState({mode: "Success"});
        
      })
      .catch(error => {
        console.error("Error:", error);

        // something went wrong
        this.setState({mode: "Error"});
      })
      .finally( () => {
        setTimeout(this.resetForm, 5000);
      });
    }
  }

  render() { 
    if(this.state.mode === "Success") { 
      return (<div>Sucess!</div>);
    } else if(this.state.mode === "Error") {
      return (
        <div></div>
      );
    } else {
      return (
        <form className="form" onSubmit={this.handleSubmit}>
          <div className="form__group">
            <label htmlFor="name" className="form__label">Name</label>
              <input id="name" type="text" name="name" placeholder="e.g. Neil Peart" className={"form__field" + (this.state.errors.name ? " error": "")}  value={this.state.data.name} onChange={this.handleTextChange} />
          
            {this.state.errors.name && 
              <ul className="form__field__error-msg">
                {this.state.errors.name.map((message, index, array) => {
                  return <li key={index}>{message}</li>;
                })}
              </ul>
            }
          </div>
        
          <div className="form__group">
            <label htmlFor="email" className="form__label">Email</label>
            <input id="email" type="email" name="email" placeholder="e.g. hello@example.com" className={"form__field" + (this.state.errors.email ? " error": "")}  value={this.state.data.email} onChange={this.handleTextChange} />
          
            {this.state.errors.email && 
              <ul className="form__field__error-msg">
                {this.state.errors.email.map((message, index, array) => {
                  return <li key={index}>{message}</li>;
                })}
              </ul>
            }
          </div>

          <div className="form__group">
            <label htmlFor="postalCode" className="form__label">Postal Code</label>
            <input id="postalCode" type="text" name="postalCode" placeholder="e.g. H0H0H0" className={"form__field" + (this.state.errors.postalCode ? " error": "")} value={this.state.data.postalCode} onChange={this.handleTextChange} />
          
            {this.state.errors.postalCode && 
              <ul className="form__field__error-msg">
                {this.state.errors.postalCode.map((message, index, array) => {
                  return <li key={index}>{message}</li>;
                })}
              </ul>
            }
          </div>

          <div className="form__group">
            <label className="form__checkboxLabel">
              <input className={"form__checkbox" + (this.state.errors.consent ? " error": "")} type="checkbox" name="consent" value={this.state.inputs.consent.value} checked={this.state.data.consent} onChange={this.handleCheckboxChange} required /> I have read and agreed to the terms and conditions.
            </label>
          </div>

          <input className="form__submit" type="submit" id="signup" value={this.state.inputs.submit.value} />
        </form>
      );
    }
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
