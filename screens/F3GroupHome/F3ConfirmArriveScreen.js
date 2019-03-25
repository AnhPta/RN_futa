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

class F3ConfirmArriveScreen extends Component {

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
    };
    this.audioPlayer = new Audio.Sound();
  }

  componentDidMount() {
    this.isCancelled = false;
    this.fetchF3Detail()
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        this.clickStartScanBarcode();
        const { params } = this.props.navigation.state
        // Kiểm tra xem có tham số reload thì reaload lại trang
        console.log(params);
        if (params && params.reload) {
          console.log('Reaload nào');
          this.fetchF3Detail();
          this.dropdown.alertWithType('success', 'Thành công', 'Xác nhận đến thành công');
          this.props.navigation.setParams({reload: 0})
        }
      }
    );
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }
  // Lấy danh sách xác nhận hàng đến
  fetchF3Detail () {
    this.setState({
      ...this.state, ...{
        loading: true
      }
    });

    let data = {
      "department_id": this.props.accountState.workDepartment.department_id
    }
    axios.post('local_f3_get_list_to_confirm_arrival', data).then(response => {
      if (response.Status == 1) {
        if (!this.isCancelled) {
          // Gán thêm trường checked
          //
          let listPackageTemp = response.Data
          listPackageTemp.map(function(item) {
            item.checked = 0;
            item.hide = 0;
            item.scan_check_arrival_date = ''; // Thời gian bắn Barcode
            return item;
          })

          // "account_arrival": "",
          // [09:22:14]       "arrival_time": null,
          // [09:22:14]       "barcode": "F30000000000383",
          // [09:22:14]       "checked": 0,
          // [09:22:14]       "f3_type_name": "",
          // [09:22:14]       "from_department_id": 377,
          // [09:22:14]       "from_department_name": "241 LÊ HỒNG PHONG",
          // [09:22:14]       "hide": 0,
          // [09:22:14]       "id": 38,
          // [09:22:14]       "note": "",
          // [09:22:14]       "number_plate": "51C-294.21",
          // [09:22:14]       "selected": 0,
          // [09:22:14]       "to_department_id": 328,
          // [09:22:14]       "vehicle_shifting_order_id": 37894983,
          // [09:22:14]       "way_name": "HCM - Noi tinh",

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
    listPackageTemp[index].scan_check_arrival_date = new Date();
    this.setState({
      ...this.state, listPackage: listPackageTemp
    });
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

  // Sang màn hình chọn tài xế // Sửa ở đây
  selectVehicle () {
    let flag = false;
    let list_f3_detail = [];
    let list_f3_search = [];
    forEach(this.state.listPackage, (item, index1) => {
      if (item.checked) {
        flag = true
        list_f3_detail.push({
          f3_detail_id: item.id,
          scan_check_arrival_date: this.getFormattedDate(item.scan_check_arrival_date)
        })
        list_f3_search.push(item.id)
      }
    })
    if (!flag) {
      alert('Không có F3 nào được chọn')
      return
    }

    this.props.navigation.navigate('F3ListCheckConfirmArriveScreen', {
      list_f3_detail: list_f3_detail,
      list_f3_search: list_f3_search
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

  render() {
    const { params } = this.props.navigation.state
    return (
      <View style={styles.container}>
        <View style={{ height: 50, alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row', backgroundColor: '#fff' }}>
          <TouchableOpacity onPress={ () => this.props.navigation.navigate('DashboradStack') }>
            <View style={{ height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 40 }}>
                <MaterialIcons name='navigate-before' size={ 35 } color='#000' style={{ fontWeight: 'bold' }} />
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Xác nhận hàng đến</Text>
            </View>
          </TouchableOpacity>
          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <TouchableOpacity onPress={ () => this.selectVehicle() }>
              <View style={{ backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 35, marginRight: 10, width: 35, height: 35, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name='telegram' size={ 22 } color='#000' style={{ fontWeight: 'bold' }} />
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
            <Ionicons name='ios-search' size={ 16 } color='#000' style={{ position: 'absolute', top: 16, left: 15, color: 'rgba(0,0,0,0.2)' }} />
            <TouchableOpacity onPress={ () => this.clearText() }>
              <View style={{ width: this.state.showCancel ? 60 : 0, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#3498db' }}>Cancel</Text>
              </View>
            </TouchableOpacity>
        </View>
        <ScrollView>
          {
            this.state.loading &&
            <ActivityIndicator size="small" color="#22409A" style={{ paddingBottom: 15 }} />
          }
          <View style={{ marginTop: 10 }}>
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
                            <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{ item.barcode }</Text>
                            <Text style={{ marginTop: 4, fontSize: 12, color: '#4a4a4a' }}>Từ: { item.from_department_name }</Text>
                          </View>
                        </View>

                        <View style={{ flex: 40, alignItems: 'flex-end', flexDirection: 'column' }}>
                          <Text style={{ fontSize: 13, fontWeight: 'bold' }}>{ item.number_plate }</Text>
                          <Text style={{ fontSize: 12 }}>{ item.way_name }</Text>
                          <Text style={{ fontSize: 12 }}>{ item.arrival_time }</Text>
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

export default connect(mapStateToProps, null)(F3ConfirmArriveScreen);
