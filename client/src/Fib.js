import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
    state = {
        seenIndexes: [],
        values: {},
        index: ''
    }

    componentDidMount() {
        this.fetchValues();
        this.fetchIndexes();
    }

    async fetchValues() {
        const values = await axios.get("api/values/current")
        this.setState({ values: values.data })
    }

    async fetchIndexes() {
        const indexes = await axios.get("api/values/all")
        this.setState({ seenIndexes: indexes.data || [] })
    }

    handleSubmit = async (event) => {
        event.preventDefault();

        if(parseFloat(this.state.index) != this.state.index) {
            alert("Invalid input!");
            return;
        }

        await axios.post("/api/values", {
            index: this.state.index
        })

        this.setState({ index: "" })
    }

    renderSeenIndexes() {
        console.log("Seen indexes: ", this.state.seenIndexes);
        return this.state.seenIndexes.map(({ number }) => number).join(", ")
    }

    renderValues() {
        const values = []

        for(let key in this.state.values) {
            values.push(<div key = {key}>
                For index {key} I have calculated {this.state.values[key]}
            </div>)
        }

        return values
    }

    render() {
        return (
            <div>
                <form onSubmit = {this.handleSubmit}>
                    <label>Please enter the index:</label>
                    <input value = {this.state.index} onChange={event => this.setState({ index: event.target.value })}></input>

                    <button type = "submit">Submit</button>
                </form>

                <h3>Indexes I have seen so far:</h3>
                {this.renderSeenIndexes()}

                <h3>Calculated values:</h3>
                {this.renderValues()}
            </div>
        )
    }
}

export default Fib