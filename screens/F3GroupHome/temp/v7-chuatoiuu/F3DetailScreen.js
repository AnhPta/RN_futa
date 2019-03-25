import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Platform, StatusBar, TouchableOpacity, ScrollView, TextInput, Modal, Alert, ActivityIndicator, FlatList, Keyboard } from 'react-native';

import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Spinner } from 'native-base';

import { Checkbox } from 'react-native-paper';

import { isIphoneXorAbove } from "../../filters";

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
      showCancel: 0,
      showAction: 0
    };
    this.audioPlayer = new Audio.Sound();
  }

  componentDidMount() {
    this.isCancelled = false;
    this.fetchF3Detail()
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        // this.clickStartScanBarcode();
        const { params } = this.props.navigation.state
        // Kiểm tra xem có tham số reload thì reaload lại trang
        if (params && params.reload) {
          console.log('display');
          this.dropdown.alertWithType('success', 'Thành công', 'Thêm gói thành công');
          this.fetchF3Detail()
          this.props.navigation.setParams({reload: 0})
        }
      }
    );
  }

  componentWillUnmount() {
    this.isCancelled = true;
    this.didFocusListener.remove();
  }

  fetchF3Detail () {
    this.setState({
      ...this.state, ...{
        loading: true
      }
    });

    // const { loading } = this.state

    // if (loading) return

    const { params } = this.props.navigation.state
    let data = {
      "f3_id": params.f3_item.id
    }
    axios.post('local_f3_get_detail', data).then(response => {
      if (response.Status == 1) {
        if (!this.isCancelled) {
          // Gán thêm trường checked
          //
          let listPackageTemp = response.Data
          listPackageTemp.map(function(item) {
            item.checked = 0;
            item.hide = 0;
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

  // Tích chọn
  selectPackage (index) {
    let listPackageTemp = this.state.listPackage;
    listPackageTemp[index].checked = ! listPackageTemp[index].checked;
    this.setState({
      ...this.state, listPackage: listPackageTemp
    });
    this.toggleAction();
  }

  // Bắn sứng
  changeText (text) {
    if ((text.length - this.state.countText) > 8) {

      let index = -1;
      // let text = 'FX0000000000963-1';
      forEach(this.state.listPackage, (item, index1) => {
          if (item.barcode && item.barcode === text.trim()) {
            index = index1;
          }
      })

      if (index >= 0) {
        let item = this.state.listPackage[index];
        if (!item.checked) {

          let listPackageTemp = this.state.listPackage;
          listPackageTemp[index].checked = ! listPackageTemp[index].checked;
          this.setState({
            ...this.state, listPackage: listPackageTemp
          });
          playSoundSuccess(this.audioPlayer)
          this.toggleAction();
          this.dropdown.alertWithType('success', 'Thành công', 'Tìm thấy mã: ' + text);
        }
        playSoundSuccess(this.audioPlayer);
      } else {
        playSoundFail(this.audioPlayer)
      }
      this.ref.clear()

    // Nếu không phải thì thôi ko search
    } else {
      this.setState({
        ...this.state, ...{
          countText: text.length
        }
      });
    }
  }

  // Submit search
  submitChangeText (event) {
    let text = event.nativeEvent.text;
    if (text) {
      forEach(this.state.listPackage, (item) => {
        if (item.barcode) {
          let n = item.barcode.indexOf(text);
          if (n < 0) {
            item.hide = 1;
          } else {
            item.hide = 0;
          }
        }
      })
    } else {
      forEach(this.state.listPackage, (item) => {
          item.hide = 0;
      })
    }

    this.setState({
      ...this.state, listPackage: this.state.listPackage
    });
  }
  clearText () {
    this.ref.clear()
      forEach(this.state.listPackage, (item) => {
        item.hide = 0;
      })
    this.setState({
      ...this.state, ...{
        listPackage: this.state.listPackage,
        showCancel: 0
      }
    });
    Keyboard.dismiss();
  }
  onFocusText (event) {
    if (this.state.showCancel == 0) {
      this.setState({
        ...this.state, showCancel: 1
      });
    }
  }

  clickStartScanBarcode () {
    this.setState({
      ...this.state, scanBarcodeStatus: 1
    });
    this.ref.focus();
    Keyboard.dismiss();
  }

  // Chọn toàn bộ gói
  selectAllPackage () {
    forEach(this.state.listPackage, (item) => {
        item.checked = !this.state.checkedAll;
    })
    this.setState({
      ...this.state, ...{
        listPackage: this.state.listPackage,
        checkedAll: !this.state.checkedAll
      }
    });
    // this.toggleAction();
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
  // Thực hiện xả túi
  unGroup () {
    const { params } = this.props.navigation.state
    let data = {
      "f3_id":  params.f3_item.id
    }
    console.log('unGroup: ', data);
    axios.post('local_f3_un_group', data).then(response => {
      console.log(response);
      if (response.Status == 1) {
        if (!this.isCancelled) {
          this.props.navigation.navigate('F3ListScreen', {
            'reload': 1
          })
        }
      } else {
        alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
      }
    })
  }

  // Xóa kiện trong túi
  confirmDeletePackage () {
    let list_package = [] // Danh sách ID các FX cần nhóm

    forEach(this.state.listPackage, (item) => {
      if (item.checked) {
        list_package.push(item.id)
      }
    })
    if (!list_package.length) {
      alert('Chọn tối thiểu 1 túi')
      return
    }
    Alert.alert(
      'Xác nhận',
      'Thực hiện xóa các túi được chọn ?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {text: 'OK', onPress: () => this.deletePackage() },
      ],
      {cancelable: false},
    );
  }
  // Thực hiện xóa kiện trong túi
  deletePackage () {
    const { params } = this.props.navigation.state
    let list_package = [] // Danh sách ID các FX cần nhóm

    forEach(this.state.listPackage, (item) => {
      if (item.checked) {
        list_package.push(item.id)
      }
    })

    let data = {
      "f3_id":  params.f3_item.id,
      list_package: list_package
    }
    console.log('deletePackage: ', data);
    axios.post('local_f3_delete_pacakge', data).then(response => {
      console.log(response);
      if (response.Status == 1) {
        if (!this.isCancelled) {
          this.dropdown.alertWithType('success', 'Thành công', 'Xóa gói thành công');
          this.fetchF3Detail()
        }
      } else {
        alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
      }
    })
  }

  // Sang màn hình thêm packge vào gói F3
  addPackageToF3 () {
    const { params } = this.props.navigation.state
    this.props.navigation.navigate('F3AddPackageToDetailScreen', {
      'f3_item': params.f3_item
    })
  }

  // Sang màn hình chọn tài xế
  selectVehicle () {
    // Kiểm tra đã chọn hết các gói mới dc cho đi
    let flag = true;
    forEach(this.state.listPackage, (item) => {
      if (!item.checked) {
        flag = false
      }
    })
    if (!flag) {
      alert('Cần chọn hết các gói')
      return
    }
    const { params } = this.props.navigation.state
    this.props.navigation.navigate('F3SelectVehicleScreen', {
      'f3_item': params.f3_item
    })
  }

  // Kích hoạt nút action ở phía góc
  toggleAction () {

    let flag = false;

    forEach(this.state.listPackage, (item, index1) => {
      if (item.checked) {
        flag = true
      }
    })

    if (flag) {
      this.setState({
        ...this.state, showAction: 1
      })
    } else {
      this.setState({
        ...this.state, showAction: 0
      })
    }

  }

  render() {
    const { params } = this.props.navigation.state
    return (
      <View style={styles.container}>
        <View style={{ height: 50, alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row', backgroundColor: '#fff' }}>
          <TouchableOpacity onPress={ () => this.props.navigation.goBack(null) }>
            <View style={{ width: 40, height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialIcons name='navigate-before' size={ 32 } color='#000' style={{ fontWeight: 'bold' }} />
            </View>
          </TouchableOpacity>
          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <TouchableOpacity onPress={ () => this.confirmUnGroup() }>
              <View style={{ backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 35, marginRight: 10, width: 35, height: 35, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name='content-cut' size={ 16 } color='#000' style={{ fontWeight: 'bold' }} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={ () => this.addPackageToF3() }>
              <View style={{ backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 35, marginRight: 10, width: 35, height: 35, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name='add' size={ 26 } color='#000' style={{ fontWeight: 'bold' }} />
              </View>
            </TouchableOpacity>
            {
              (this.state.showAction == 1 || this.state.checkedAll) &&
              <TouchableOpacity onPress={ () => this.confirmDeletePackage() }>
                <View style={{ backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 35, marginRight: 10, width: 35, height: 35, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name='trash-can-outline' size={ 20 } color='#000' style={{ fontWeight: 'bold' }} />
                </View>
              </TouchableOpacity>
            }
            {
              this.state.checkedAll &&
              <TouchableOpacity onPress={ () => this.selectVehicle() }>
                <View style={{ backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 35, marginRight: 10, width: 35, height: 35, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name='telegram' size={ 22 } color='#000' style={{ fontWeight: 'bold' }} />
                </View>
              </TouchableOpacity>
            }

          </View>
        </View>
        {/*// Nút seach*/}
        <View style={{ paddingLeft: 5, paddingRight: 5, paddingBottom: 5, paddingTop: 5, display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' }}>
          <TextInput
            ref={ref => (this.ref = ref)}
            placeholder="Quét hoặc gõ tìm kiếm"
            onChangeText={(text) => this.changeText(text)}
            onSubmitEditing={(event) => this.submitChangeText(event) }
            onFocus={(event) => this.onFocusText(event) }
            style={{ height: 30, backgroundColor: 'rgba(0,0,0,0.05)', paddingLeft: 34, borderRadius: 4, flexGrow: 1 }}>
            </TextInput>
            <Ionicons name='ios-search' size={ 16 } color='#000' style={{ position: 'absolute', top: 12, left: 15, color: 'rgba(0,0,0,0.2)' }} />
            <TouchableOpacity onPress={ () => this.clearText() }>
              <View style={{ width: this.state.showCancel ? 60 : 0, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#3498db' }}>Cancel</Text>
              </View>
            </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: '#e5e5e5', paddingLeft: 10, height: 30, marginBottom: 10, alignItems: 'center', flexDirection: 'row' }}>
          <MaterialCommunityIcons name='map-marker-radius' size={ 20 } color='#000' />
          <Text style={{ fontSize: 13, paddingLeft: 8 }}>
            { params.f3_item.barcode }
          </Text>
        </View>

        {/*Danh sách*/}
        <ScrollView>
          {
            this.state.loading &&
            <ActivityIndicator size="small" color="#22409A" style={{ paddingBottom: 15 }} />
          }
          <TouchableOpacity  onPress={() => this.selectAllPackage() }>
            <View style={{ height: 50, borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', marginRight: 10, marginLeft: 10, justifyContent: 'space-between' }}>

              <View style={{ display: 'flex', flexDirection: 'row', alignItems:'center', flex: 60 }}>
                {
                  this.state.checkedAll ?
                    <MaterialCommunityIcons name='check-circle' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                  :
                  <MaterialCommunityIcons name='checkbox-blank-circle-outline' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                }
                <View style={{ display: 'flex', flexDirection: 'column', marginLeft: 5 }}>
                  <Text style={{ fontSize: 15, fontWeight: 'bold' }}>Chọn tất cả</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <View>
            {
              this.state.listPackage.map((item, index) => {
                if (!item.hide) {
                  return (
                    <TouchableOpacity key={item.barcode} onPress={() => this.selectPackage(index) }>
                      <View style={{ height: 70, borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', marginRight: 10, marginLeft: 10, justifyContent: 'space-between' }}>

                        <View style={{ display: 'flex', flexDirection: 'row', alignItems:'center', flex: 60 }}>
                          {
                            item.checked ?
                              <MaterialCommunityIcons name='check-circle' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                            :
                            <MaterialCommunityIcons name='checkbox-blank-circle-outline' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                          }
                          <View style={{ display: 'flex', flexDirection: 'column', marginLeft: 5 }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{ item.barcode }</Text>
                            <Text style={{ marginTop: 4, fontSize: 13, color: '#4a4a4a' }}>{ item.product_name } - { item.product_weight } kg</Text>
                            <Text style={{ marginTop: 4, fontSize: 12, color: '#4a4a4a' }}>Đến: { item.department_to }</Text>
                          </View>
                        </View>

                        <View style={{ flex: 40, alignItems: 'flex-end', flexDirection: 'column' }}>
                          <Text style={{ fontSize: 12 }}>{ item.time_wait }</Text>
                        </View>

                      </View>
                    </TouchableOpacity>
                  )
                }
              })
            }
          </View>
        </ScrollView>
        <DropdownAlert
          closeInterval={1500}
          updateStatusBar={false}
          defaultContainer={{padding: 8, paddingTop: 20, flexDirection: 'row'}}
          ref={ref => this.dropdown = ref} />
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

export default connect(mapStateToProps, null)(F3DetailScreen);
