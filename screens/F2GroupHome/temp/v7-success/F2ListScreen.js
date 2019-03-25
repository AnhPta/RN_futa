import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Dimensions , Keyboard, StatusBar, Platform} from 'react-native';

import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Spinner } from 'native-base';

import DropdownAlert from 'react-native-dropdownalert';

import { isIphoneXorAbove } from "../../filters";

import axios from "../../axios"
import { connect } from 'react-redux';
import { findIndex, forEach, chain, groupBy, map, filter } from 'lodash'
import { Audio } from 'expo';
import Loader from '../Helper/Loader';

import { checkColor, checkTypePackage, playSoundSuccess, playSoundFail } from "../Helper/Funtions"

class F2ListScreen extends Component {

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      loading: false,
      loadingModal: false,
      modalVisible: false,
      listPackage: [],
      countText: 0,
      scanBarcodeStatus: 1,
      showCancel: 0,
      listPackageF1: [],
      item: {}
    };
    this.audioPlayer = new Audio.Sound();
  }

  componentDidMount() {
    this.isCancelled = false;
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        if (Platform.OS === 'android') {
          this.clickStartScanBarcode();
        }
        this.fetchLocalF2GetListPackageToGroup();

        const { params } = this.props.navigation.state
        if (params && params.reload) {
          this.dropdown.alertWithType('success', 'Thành công', 'Xả túi thành công');
          this.props.navigation.setParams({reload: 0})
        }
      }
    );
  }

  componentWillUnmount() {
    this.isCancelled = true;
    this.didFocusListener.remove();
  }

  fetchLocalF2GetListPackageToGroup () {
    console.log('Get lai data danh sach List');
    this.setState({
      ...this.state, loading: true
    });

    let data = {
      "department_id": this.props.accountState.workDepartment.department_id
    }
    axios.post('local_f2_get_list_package_to_group', data).then(response => {
      if (response.Status == 1) {

        if (!this.isCancelled) {
          // Gán thêm trường checked
          let listPackageTemp = response.Data

          listPackageTemp.map(function(item) {
            item.checked = 0;
            item.color_app = checkColor(item.color);
            item.type_package_app = checkTypePackage(item.barcode);
            item.hide = 0;
            return item;
          })

          // Xóa bớt package
          listPackageTemp = listPackageTemp.filter(function(val) { return val.type_package_app == 2; });

          // Group By
          listPackageTemp = chain(listPackageTemp).groupBy("department_to").map(function(v, i) {
            return {
              department_to: i,
              items: map(v)
            }
          }).value();

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

  // Bắn sứng
  changeText (text) {
    if ((text.length - this.state.countText) > 8) {

      let indexGroupBy = -1;
      let index = -1;

      forEach(this.state.listPackage, (itemGroup, indexGroupBy1) => {
        forEach(itemGroup.items, (item, index1) => {
          if (item.barcode === text.trim()) {
            indexGroupBy = indexGroupBy1
            index = index1;
          }
        })
      })

      if (indexGroupBy >= 0 && index >= 0) {
        let item = this.state.listPackage[indexGroupBy].items[index];
        if (!item.checked) {
          if (this.checkSameToDepartment(item)) {
            let listPackageTemp = this.state.listPackage;
            listPackageTemp[indexGroupBy].items[index].checked = ! listPackageTemp[indexGroupBy].items[index].checked;
            this.setState({
              ...this.state, listPackage: listPackageTemp
            });
            playSoundSuccess(this.audioPlayer)
            this.dropdown.alertWithType('success', 'Thành công', 'Tìm thấy mã: ', text);
          } else {
            playSoundFail(this.audioPlayer)
            this.dropdown.alertWithType('warn', 'Có lỗi xảy ra ', 'Danh sách hàng nhóm túi không cùng nơi đến');
          }
        }
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
  selectPackage (indexGroupBy, index) {
    let item = this.state.listPackage[indexGroupBy].items[index];
    if (!item.checked) {
      if (this.checkSameToDepartment(item)) {
        let listPackageTemp = this.state.listPackage;
        listPackageTemp[indexGroupBy].items[index].checked = ! listPackageTemp[indexGroupBy].items[index].checked;
        this.setState({
          ...this.state, listPackage: listPackageTemp
        });
      } else {
        playSoundFail(this.audioPlayer)
        this.dropdown.alertWithType('warn', 'Có lỗi xảy ra ', 'Danh sách hàng nhóm túi không cùng nơi đến');
      }
    } else {
      let listPackageTemp = this.state.listPackage;
      listPackageTemp[indexGroupBy].items[index].checked = ! listPackageTemp[indexGroupBy].items[index].checked;
      this.setState({
        ...this.state, listPackage: listPackageTemp
      });
    }
  }

  // Submit search
  submitChangeText (event) {

    let text = event.nativeEvent.text;

    if (text) {
      forEach(this.state.listPackage, (itemGroup, indexGroupBy1) => {
        forEach(itemGroup.items, (item, index1) => {
          let n = item.barcode.indexOf(text);
          if (n < 0) {
            item.hide = 1;
          }
        })
      })
    } else {
      forEach(this.state.listPackage, (itemGroup, indexGroupBy1) => {
        forEach(itemGroup.items, (item, index1) => {
          item.hide = 0;
        })
      })
    }

    this.setState({
      ...this.state, listPackage: this.state.listPackage
    });
  }

  clearText () {
    this.ref.clear()
    forEach(this.state.listPackage, (itemGroup, indexGroupBy1) => {
      forEach(itemGroup.items, (item, index1) => {
        item.hide = 0;
      })
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

  getF2Detail (item) {
    console.log(item);
    this.props.navigation.navigate('F2DetailScreen', {
      'f2_item': item
    })
  }

  // Phần Seach
  doWork (items) {
    let flag = false; // Toàn bộ hide = 1
    forEach(items, (item, index) => {
      // Có 1 cái hide = 0 thì
      if (!item.hide) {
        flag = true
      }

    })
    return flag ? true : false;
  }



  render() {
    const DeviceWidth = Dimensions.get('window').width - 150
    return (
      <View style={styles.container}>
        <View style={{ height: 50, alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row', backgroundColor: '#fff' }}>
          <TouchableOpacity  onPress={ () => this.props.navigation.navigate('DashboradStack') } >
            <View style={{ height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 40 }}>
                <MaterialIcons name='navigate-before' size={ 35 } color='#000' style={{ fontWeight: 'bold' }} />
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Danh sách F2</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ paddingLeft: 5, paddingRight: 5, paddingBottom: 10, paddingTop: 10, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            ref={ref => (this.ref = ref)}
            placeholder="Quét hoặc gõ tìm kiếm ..."
            placeholderTextColor="#4a4a4a"
            onChangeText={(text) => this.changeText(text)}
            onSubmitEditing={(event) => this.submitChangeText(event) }
            onFocus={(event) => this.onFocusText(event) }
            style={{ height: 30, backgroundColor: 'rgba(0,0,0,0.05)', paddingLeft: 34, borderRadius: 4, flexGrow: 1 }}>
            </TextInput>
            <Ionicons name='ios-search' size={ 16 } color='#000' style={{ position: 'absolute', top: 16, left: 15, color: 'rgba(0,0,0,0.2)' }} />
            <TouchableOpacity onPress={ () => this.clearText() }>
              <View style={{ width: this.state.showCancel ? 60 : 0, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#000' }}>Xóa</Text>
              </View>
            </TouchableOpacity>
        </View>
        <ScrollView>
          <View>
            {
              this.state.listPackage.map((groupBy) => {
                return (
                  <View key={groupBy.department_to}>
                    {
                      this.doWork(groupBy.items) &&

                      <View style={{ backgroundColor: '#e5e5e5', paddingLeft: 10, height: 30, alignItems: 'center', flexDirection: 'row' }}>
                        <MaterialCommunityIcons name='map-marker-radius' size={ 20 } color='#000' />
                        <Text style={{ fontSize: 13, paddingLeft: 8, fontWeight: 'bold' }}>
                          { groupBy.department_to }
                        </Text>
                      </View>
                    }

                    {
                      groupBy.items.map((item) => {
                        if (!item.hide) {
                          return (
                            <TouchableOpacity key={item.barcode} onPress={() => this.getF2Detail(item) }>
                              <View style={{ height: 70, borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', marginRight: 10, marginLeft: 10, justifyContent: 'space-between' }}>

                                <View style={{ display: 'flex', flexDirection: 'row', alignItems:'center', flex: 60 }}>
                                  <View style={{ display: 'flex', flexDirection: 'column', marginLeft: 5 }}>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{ item.barcode }</Text>
                                    <Text style={{ marginTop: 4, fontSize: 14, color: '#4a4a4a' }}>{ item.quantity_total } kiện - { item.product_weight } kg</Text>
                                  </View>
                                </View>

                                <View style={{ flex: 40, alignItems: 'flex-end', flexDirection: 'column' }}>
                                  <Text style={{ fontSize: 12 }}>{ item.time_wait }</Text>
                                  <MaterialCommunityIcons style={{ marginTop: 8, color: item.color_app }} name='checkbox-blank-circle' size={ 14 } />
                                </View>

                              </View>
                            </TouchableOpacity>
                          )
                        }
                      })
                    }
                  </View>
                )
              })
            }
          </View>
        </ScrollView>
        {
          this.state.loading &&
          <Spinner color='#22409A' size='small' style={{ paddingRight: 15 }} />
        }
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

export default connect(mapStateToProps, null)(F2ListScreen);
