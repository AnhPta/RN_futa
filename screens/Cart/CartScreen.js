import React, { Component } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

//REDUX
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { counterIncrease } from './redux/action';

class CartScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      reload: 0
    };
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Count In Redux</Text>
        <Text>{ this.props.cartState.count }</Text>
        <Button
          onPress={() => this.props.counterIncrease(2)}
          title="Tăng lên"
          color="#841584"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8'
  }
});

const mapStateToProps = state => ({
  cartState: state.cartState
});

const mapDispatchToProps = dispatch => (
  bindActionCreators(
    {
      counterIncrease
    }, dispatch
  )
);

export default connect(mapStateToProps, mapDispatchToProps)(CartScreen);
