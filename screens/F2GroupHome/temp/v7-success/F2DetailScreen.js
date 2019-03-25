import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Platform, StatusBar, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';

import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Spinner } from 'native-base';

import { Checkbox } from 'react-native-paper';

import { isIphoneXorAbove } from "../../filters";

import axios from "../../axios"
import { connect } from 'react-redux';
import { findIndex, forEach } from 'lodash'

import { checkColor, checkTypePackage } from "../Helper/Funtions"
import Loader from '../Helper/Loader';

class F2DetailScreen extends Component {

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      loading: false,
      loadingModal: false,
      listPackage: []
    };
  }

  componentDidMount() {
    this.isCancelled = false;
    const { params } = this.props.navigation.state
    this.fetchF2Detail(params.f2_item.bill_id)
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
      "f2_id": bill_id
    }
    axios.post('local_f2_get_detail', data).then(response => {
      if (response.Status == 1) {
        if (!this.isCancelled) {
          // Gán thêm trường checked
          //
          let listPackageTemp = response.Data
          listPackageTemp.map(function(item) {
            item.color_app = checkColor(item.color);
            item.type_package_app = checkTypePackage(item.barcode);
            return item;
          })

          console.log(listPackageTemp);
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
    this.setState({
      ...this.state, loadingModal: true
    });
    const { params } = this.props.navigation.state
    let data = {
      "f2_id":  params.f2_item.bill_id
    }
    axios.post('local_f2_ungroup', data).then(response => {
      this.setState({
        ...this.state, ...{
          loadingModal: false
        }
      });
      console.log(response);
      setTimeout(() => {
        if (response.Status == 1) {
          if (!this.isCancelled) {
            this.props.navigation.navigate('F2ListScreen', {
              'reload': 1
            })
          }
        } else {
          alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
        }
      }, 200)

    })
  }

  render() {
    const { params } = this.props.navigation.state
    return (
      <View style={styles.container}>
        <Loader loading={ this.state.loadingModal } />
        <View style={{ height: 50, alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row', backgroundColor: '#fff' }}>
          <TouchableOpacity onPress={ () => this.props.navigation.goBack(null) }>
            <View style={{ width: 40, height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialIcons name='navigate-before' size={ 35 } color='#000' style={{ fontWeight: 'bold' }} />
            </View>
          </TouchableOpacity>
          <Text style={{ fontSize: 15, fontWeight: 'bold' }}>Chi tiết - { params.f2_item.barcode }</Text>
          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <TouchableOpacity onPress={ () => this.confirmUnGroup() }>
              <View style={{ backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 35, marginRight: 10, width: 35, height: 35, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name='content-cut' size={ 22 } color='#000' style={{ fontWeight: 'bold' }} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ backgroundColor: '#e5e5e5', paddingLeft: 10, height: 30, marginBottom: 10, alignItems: 'center', flexDirection: 'row' }}>
          <MaterialCommunityIcons name='map-marker-radius' size={ 20 } color='#000' />
          <Text style={{ fontSize: 13, paddingLeft: 8, fontWeight: 'bold' }}>
            { params.f2_item.department_to }
          </Text>
        </View>

        <ScrollView>
          <View>
            {
              this.state.listPackage.map((item, index) => {
                return (
                  <TouchableOpacity key={item.barcode}>
                    <View style={{ height: 60, borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', marginRight: 10, marginLeft: 10, justifyContent: 'space-between' }}>

                      <View style={{ display: 'flex', flexDirection: 'row', alignItems:'center', flex: 60 }}>
                        <View style={{ display: 'flex', flexDirection: 'column', marginLeft: 5 }}>
                          <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{ item.barcode }</Text>
                          <Text style={{ marginTop: 4, fontSize: 13, color: '#4a4a4a' }}>{ item.product_name } - { item.product_weight } kg</Text>
                        </View>
                      </View>

                      <View style={{ flex: 40, alignItems: 'flex-end', flexDirection: 'column' }}>
                        <Text style={{ fontSize: 12 }}>{ item.time_wait }</Text>
                        <MaterialCommunityIcons style={{ marginTop: 8, color: item.color_app }} name='checkbox-blank-circle' size={ 14 } />
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
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'ios' ? (isIphoneXorAbove() ? 44 : 20) : StatusBar.currentHeight
  }
});

const mapStateToProps = state => ({
  accountState: state.accountState
});

export default connect(mapStateToProps, null)(F2DetailScreen);
