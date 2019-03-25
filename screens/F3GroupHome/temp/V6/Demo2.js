import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Platform, StatusBar, TouchableOpacity, ScrollView, TextInput, Modal, Alert, ActivityIndicator, FlatList, Keyboard } from 'react-native';

import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Spinner } from 'native-base';

import { Checkbox } from 'react-native-paper';

import axios from "../../axios"
import { connect } from 'react-redux';
import { findIndex, forEach } from 'lodash'

import DropdownAlert from 'react-native-dropdownalert';
import { Audio } from 'expo';
import { checkColor, checkTypePackage, playSoundSuccess, playSoundFail } from "../Helper/Funtions"

class F3DetailScreen extends Component {

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      loading: false,
      checkedAll: false,
      listPackage: [],
      countText: 0,
      scanBarcodeStatus: 1,
      showCancel: 1,
    };
  }

  componentDidMount() {
    console.log('ưqdqdq');
    fetch("https://jsonplaceholder.typicode.com/photos")
    .then(response => response.json())
    .then(responseJson => {
      responseJson = responseJson.map(item => {
        item.isSelect = false;
        item.selectedClass = styles.list;
      return item;
    });

    // responseJson = [
    //   {
    //     id: 1
    //   },
    //   {
    //     id: 2
    //   }
    // ]
    this.setState({
      loading: false,
      listPackage: responseJson,
    });
    }).catch(error => {this.setState({loading: false});
    });
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>32132131</Text>
        <ScrollView>
          {
            this.state.loading &&
            <ActivityIndicator size="small" color="#22409A" style={{ paddingBottom: 15 }} />
          }
          <View>
            {
              this.state.listPackage.map((item, index) => {
                if (!item.hide) {
                  return (
                    <TouchableOpacity key={item.id}>
                      <View style={{ height: 70, borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', marginRight: 10, marginLeft: 10, justifyContent: 'space-between' }}>

                        <Text>{ item.id }</Text>

                      </View>
                    </TouchableOpacity>
                  )
                }
              })
            }
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: StatusBar.currentHeight
  }
});

const mapStateToProps = state => ({
  accountState: state.accountState
});

export default connect(mapStateToProps, null)(F3DetailScreen);
