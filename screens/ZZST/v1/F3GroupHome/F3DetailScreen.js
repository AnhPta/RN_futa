import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Platform, StatusBar, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';

import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Spinner } from 'native-base';

import { Checkbox } from 'react-native-paper';

import axios from "../../axios"
import { connect } from 'react-redux';
import { findIndex, forEach } from 'lodash'

class F2DetailScreen extends Component {

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      loading: false,
      listPackage: []
    };
  }

  componentDidMount() {
    this.isCancelled = false;

    const { params } = this.props.navigation.state
    this.fetchF2Detail(params.f3_item.id)
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  fetchF2Detail (bill_id) {
    this.setState({
      ...this.state, ...{
        loading: true
      }
    });

    let data = {
      "f3_id": bill_id
    }
    console.log(data);
    axios.post('local_f3_get_detail', data).then(response => {

      if (response.Status == 1) {
        if (!this.isCancelled) {
          // Gán thêm trường checked
          let _this = this
          let listPackageTemp = response.Data
          listPackageTemp.map(function(item) {
            item.color_app = _this.checkColor(item.color);
            item.type_package_app = _this.checkTypePackage(item.barcode);
            return item;
          })

          // Lưu
          this.setState({
            ...this.state, ...{
              loading: false,
              listPackage: listPackageTemp
            }
          });
        }
      } else {
        alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
      }
    })
  }

  checkColor (itemColor) {
    let color = '#fff'

    if (itemColor === 'Blue') {
      color = 'blue'
    }

    return color
  }

  checkTypePackage (barcode) {
    let type = 1

    if (barcode) {
      var res = barcode.substring(1, 2);
      if (res == 2) {
        type = 2
      }
      if (res == 3) {
        type = 3
      }
    }
    return type
  }

  // Xả túi
  confirmUnGroup () {
    Alert.alert(
      'Xác nhận',
      'Thực hiện xả túi ?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {text: 'OK', onPress: () => this.unGroup() },
      ],
      {cancelable: false},
    );
  }

  unGroup () {
    const { params } = this.props.navigation.state
    let data = {
      "f3_id":  params.f3_item.bill_id
    }
    axios.post('local_f2_ungroup', data).then(response => {

      if (response.Status == 1) {
        if (!this.isCancelled) {
          this.props.navigation.goBack(null)
        }
      } else {
        alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
      }
    })
  }

  render() {
    const { params } = this.props.navigation.state
    return (
      <View style={styles.container}>
        <View style={{ height: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row' }}>
          <TouchableOpacity  onPress={ () => this.props.navigation.goBack(null) } >
            <View style={{ minWidth: 75, height: 50, paddingLeft: 15, justifyContent: 'center', display: 'flex' }}>
              <MaterialIcons name='arrow-back' size={26} color='#535c68' />
            </View>
          </TouchableOpacity>
          <Text style={{ color: '#212121', fontSize: 15, fontWeight: 'bold' }}>
            CHI TIẾT: { params.f3_item.barcode }
          </Text>
          <TouchableOpacity onPress={ () => this.confirmUnGroup() }>
            <View style={{ minWidth: 75, height: 50, paddingLeft: 15, justifyContent: 'center', display: 'flex' }}>
              <Text style={{ fontSize: 15 }}>Xả túi</Text>
            </View>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View style={{ paddingTop: 10 }}>
            {
              this.state.listPackage.map((item, index) => {
                  return (
                    <TouchableOpacity key={item.barcode}>
                      <View style={{ height: 90, backgroundColor: item.checked ? '#4ADFD0' : '#fff', borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', paddingRight: 10, paddingLeft: 1, justifyContent: 'space-between' }}>

                        <View style={{ display: 'flex', flexDirection: 'row', alignItems:'center', flex: 60 }}>
                          <View style={{ width: 3, height: 88, backgroundColor: item.color_app, marginRight: 5 }}></View>
                          <View style={{ display: 'flex', flexDirection: 'column', marginLeft: 5 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{ item.barcode }</Text>
                            <Text style={{ marginTop: 5, fontSize: 11 }}>Đến: { item.department_to }</Text>
                          </View>
                        </View>

                        <View style={{ flex: 40, alignItems: 'flex-end', flexDirection: 'column' }}>
                          <Text style={{ fontSize: 12 }}>{ item.product_name } - { item.product_weight } kg</Text>
                          <Text style={{ fontSize: 12 }}>{ item.package_description }</Text>
                        </View>

                      </View>
                    </TouchableOpacity>
                  )
              })
            }
          </View>
          {
            this.state.loading &&
            <Spinner color='#22409A' size='small' style={{ paddingRight: 15 }} />
          }
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    paddingTop: StatusBar.currentHeight
  }
});

const mapStateToProps = state => ({
  accountState: state.accountState
});

export default connect(mapStateToProps, null)(F2DetailScreen);
