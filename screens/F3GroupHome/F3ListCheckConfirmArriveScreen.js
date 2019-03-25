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

class F3ListCheckConfirmArriveScreen extends Component {

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
    this.audioPlayer = new Audio.Sound();
    this.selectPackage = this.selectPackage.bind(this);
    this.changeStatusLost = this.changeStatusLost.bind(this);
    this.changeStatusBroken = this.changeStatusBroken.bind(this);
  }

  componentDidMount() {
    this.isCancelled = false;
    this.fetchF3Detail()
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        this.clickStartScanBarcode();
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

    const { params } = this.props.navigation.state
    let data = {
      "list_f3_id": params.list_f3_search
    }
    console.log('=========Danh Sách F3 Cần xác nhận============');
    console.log(data);
    console.log('============================================');

    console.log(new Date());
    axios.post('local_f3_get_detail_by_list_f3', data).then(response => {

      if (response.Status == 1) {
        if (!this.isCancelled) {
          let listPackageTemp = response.Data

            // listPackageTemp = [
            //     { 'barcode': Math.floor(Math.random() * 9999999999999999) + 1, 'product_name': 'Bưu phẩm'},
            //     { 'barcode': Math.floor(Math.random() * 9999999999999999) + 1, 'product_name': 'Bưu phẩm'},
            // ]

          console.log(new Date());


          listPackageTemp.map(function(item) {
            item.checked = 0;
            item.hide = 0;
            item.lost = 0;
            item.broken = 0;
            item.scan_check_arrival_date = '';
            return item;
          })

          console.log(new Date());
          console.log(listPackageTemp);
          // Lưu
          this.setState({
            ...this.state, ...{
              loading: false,
              listPackage: listPackageTemp
            }
          });
          console.log(new Date());
        }
      } else {
        alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
      }
    })
  }

  // Tích chọn
  //
  selectPackage = (item, index) => () => {
    // console.log(new Date());
    item.checked = !item.checked
    item.scan_check_arrival_date = new Date();
    this.state.listPackage[index] = item
    this.setState({
      ...this.state, listPackage: this.state.listPackage
    });
    // console.log(new Date());
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
          listPackageTemp[index].scan_check_arrival_date = new Date();
          this.setState({
            ...this.state, listPackage: listPackageTemp
          });
          playSoundSuccess(this.audioPlayer)

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

  changeStatusLost = (index) => () =>  {
    this.state.listPackage[index].lost = ! this.state.listPackage[index].lost;
    this.setState({
      ...this.state, listPackage: this.state.listPackage
    });
  }

  changeStatusBroken = (index) => () => {
    this.state.listPackage[index].broken = ! this.state.listPackage[index].broken;
    this.setState({
      ...this.state, listPackage: this.state.listPackage
    });
  }


  // XÁC NHẬN HÀNG ĐẾN
  // Hỏi
  questionConfirmArrive () {
    this.actionConfirmArrive()
    // Alert.alert(
    //   'Thông báo',
    //   'Xác nhận hàng đến ?',
    //   [
    //     {
    //       text: 'Cancel',
    //       style: 'cancel',
    //     },
    //     {text: 'OK', onPress: () => this.actionConfirmArrive() },
    //   ],
    //   {cancelable: false},
    // );
  }

  actionConfirmArrive () {
    const { params } = this.props.navigation.state
    let flag = false; // Check tổng

    forEach(params.list_f3_search, (f3_id) => {

      let list_package_arrival_id = []; // Hàng đến
      let list_package_missing_id = []; // Hàng mất
      let list_package_damaged_id = []; // Hàng hỏng
      let list_f3_detail = []; // Danh sách detail
      let flagTemp = false; // Check từng f3_id

      forEach(this.state.listPackage, (item) => {
        if (item.checked && item.bill_f3_id === f3_id) {
          flag = true
          flagTemp = true
          list_f3_detail.push({
            f3_detail_id: item.f3_detail_id,
            scan_check_arrival_date: this.getFormattedDate(item.scan_check_arrival_date)
          })
          list_package_arrival_id.push(item.id)
        }
        if (item.lost) {
          list_package_missing_id.push(item.id)
        }
        if (item.broken) {
          list_package_damaged_id.push(item.id)
        }
      })

      // Nếu có chọn gói của F3_ID nào đó thì mới bắn đi

      if (flagTemp) {
        let data = {
          f3_id: f3_id,
          list_f3_detail: list_f3_detail,
          list_package_arrival_id: list_package_arrival_id,
          list_package_missing_id: list_package_missing_id,
          list_package_damaged_id: list_package_damaged_id,
          current_department_id: this.props.accountState.workDepartment.department_id
        }
        console.log('======= DỮ LIỆU BẮN LÊN =========');
        console.log(data);
        console.log('========= HET =========');

        axios.post('local_f3_confirm_arrive', data).then(response => {
          if (response.Status == 1) {
            if (!this.isCancelled) {
              console.log('========response========');
              console.log(response);
            }
          } else {
            alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
          }
        })
      }

    })

    if (!flag) {
      alert('Không có gói nào được chọn')
      return
    }

    this.props.navigation.navigate('F3ConfirmArriveScreen', {
      'reload': 1,
      'success': 1
    })

  }

  // Convert ngày tháng năm
  getFormattedDate(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10 ) {
        month = "0" + month;
    }
    let day = date.getDate();
    if (day < 10 ) {
        day = "0" + day;
    }
    let str = year + "-" + month + "-" + day + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return str;
  }


  /// RENDER BẰNG FLAST LIST
  handleRenderItem = ({item, index}) => {
    if (!item.hide) {
      return (
        <View key={item.barcode} style={{ height: 90, borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', marginRight: 10, marginLeft: 10, justifyContent: 'space-between' }}>
          <TouchableOpacity style={{ flex: 60, height: 90, justifyContent: 'center' }} onPress={ this.selectPackage(item,index) }>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems:'center' }}>
              {
                item.checked ?
                  <MaterialCommunityIcons name='check-circle' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                :
                <MaterialCommunityIcons name='checkbox-blank-circle-outline' size={ 22 } color='#000' style={{ marginRight: 5 }} />
              }
              <View style={{ display: 'flex', flexDirection: 'column', marginLeft: 5 }}>
                <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{ item.barcode }</Text>
                <Text style={{ marginTop: 4, fontSize: 13, color: '#4a4a4a' }}>
                  Bưu phẩm - 5kg
                </Text>
                <Text>F3_detail_ID: { item.f3_detail_id }</Text>
                <Text>Bill_f3_id: { item.bill_f3_id }</Text>
              </View>
            </View>
          </TouchableOpacity>
          <View style={{ flex: 40, backgroundColor: '#fff', flexDirection: 'row', height: 68 }}>
            <TouchableOpacity onPress={ this.changeStatusLost(index) } style={{ flex: 50, height: 68, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
              <View>
                {
                  item.lost ?
                    <MaterialCommunityIcons name='checkbox-marked' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                  :
                    <MaterialCommunityIcons name='checkbox-blank-outline' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                }
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={ this.changeStatusBroken(index) } style={{ flex: 50, height: 68, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
              <View>
                {
                  item.broken ?
                    <MaterialCommunityIcons name='checkbox-marked' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                  :
                    <MaterialCommunityIcons name='checkbox-blank-outline' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                }
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
  }

  render() {
    const { params } = this.props.navigation.state
    return (
      <View style={styles.container}>
        <View style={{ height: 50, alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row', backgroundColor: '#fff' }}>
          <TouchableOpacity onPress={ () => this.props.navigation.navigate('F3ConfirmArriveScreen', {reload: 0}) }>
            <View style={{ height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 40 }}>
                <MaterialIcons name='navigate-before' size={ 35 } color='#000' style={{ fontWeight: 'bold' }} />
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Check list F1 F2</Text>
            </View>
          </TouchableOpacity>
          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <TouchableOpacity onPress={ () => this.questionConfirmArrive() }>
              <View style={{ backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 35, marginRight: 10, width: 35, height: 35, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name='check-all' size={ 22 } color='#000' style={{ fontWeight: 'bold' }} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingLeft: 5, paddingRight: 5, paddingBottom: 5, paddingTop: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' }}>
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
                <Text style={{ color: '#000' }}>Xóa</Text>
              </View>
            </TouchableOpacity>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', marginRight: 10, marginLeft: 10, borderBottomWidth: 1, borderColor: '#F3F3F3' }}>
          <View style={{ flex: 60, height: 30 }}>

          </View>
          <View style={{ flex: 20, height: 30, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Thất lạc</Text>
          </View>
          <View style={{ flex: 20, height: 30, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Suy suyển</Text>
          </View>
        </View>
          {
            this.state.loading &&
            <ActivityIndicator size="small" color="#22409A" style={{ paddingBottom: 15, paddingTop: 15 }} />
          }
        {
            this.state.listPackage &&
            <FlatList
              data={this.state.listPackage}
              keyExtractor={item => item.barcode.toString()}
              extraData={this.state}
              renderItem={this.handleRenderItem}
            />
        }
        <DropdownAlert
          closeInterval={1500}
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

export default connect(mapStateToProps, null)(F3ListCheckConfirmArriveScreen);
