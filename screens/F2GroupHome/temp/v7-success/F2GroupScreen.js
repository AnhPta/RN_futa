import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Dimensions , Keyboard, StatusBar, Platform, FlatList} from 'react-native';

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

class F2GroupScreen extends Component {

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      loading: true,
      refreshing: false,
      loadingModal: false,
      modalVisible: false,
      listPackage: [],
      countText: 0,
      scanBarcodeStatus: 1,
      showCancel: 0,
      showAction: 0
    };
    this.audioPlayer = new Audio.Sound();
    this.doWork = this.doWork.bind()
    // FlatList
    this.handleRenderItem = this.handleRenderItem.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
  }

  componentDidMount() {
    this.isCancelled = false;
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        this.clickStartScanBarcode();
      }
    );
    this.fetchLocalF2GetListPackageToGroup(false);
  }

  componentWillUnmount() {
    this.isCancelled = true;
    this.didFocusListener.remove();
  }

  fetchLocalF2GetListPackageToGroup (loading = false) {
    if (loading) {
      this.setState({
        ...this.state, loading: true
      });
    }

    let data = {
      "department_id": this.props.accountState.workDepartment.department_id
    }
    axios.post('local_f2_get_list_package_to_group', data).then(response => {
      if (response.Status == 1) {

        if (!this.isCancelled) {
          // Gán thêm trường checked
          let listPackageTemp = response.Data

          // listPackageTemp.map(function(item) {
          //   item.checked = 0;
          //   item.color_app = checkColor(item.color);
          //   item.type_package_app = checkTypePackage(item.barcode);
          //   item.hide = 0;
          //   return item;
          // })

          // // Xóa bớt package
          // listPackageTemp = listPackageTemp.filter(function(val) { return val.type_package_app == 1; });

          // // Group By
          // listPackageTemp = chain(listPackageTemp).groupBy("department_to").map(function(v, i) {
          //   return {
          //     department_to: i,
          //     items: map(v)
          //   }
          // }).value();
          listPackageTemp = []
          console.log(new Date());
          for (let i = 0; i < 6000; i++) {
            let items = []
            for (let j = 0; j < 10; j++) {
              items.push(
                {id: Math.floor(Math.random() * 55555555555555555555) + 1, barcode: Math.floor(Math.random() * 55555555555555555555) + 1, product_name: 'Bưu Phẩm'},
              )
            }
            listPackageTemp.push(
              {
                department_to: Math.floor(Math.random() * 99999999999999999) + 1,
                items: items
              }
            )
          }
          console.log(new Date());
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
            this.toggleAction();
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

    this.toggleAction();
  }

  checkSameToDepartment (item) {
    let packageSlected = [];
    forEach(this.state.listPackage, (itemGroup) => {
      forEach(itemGroup.items, (item) => {
        if (item.checked && item.type_package_app === 1) {
          packageSlected.push(item.to_department_id)
        }
      })
    })
    if (packageSlected.length) {
      if (packageSlected.includes(item.to_department_id)) {
        return true;
      }
      return false
    }
    return true
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

  openModal () {
    this.setState({
      ...this.state, modalVisible: true
    });
  }

  // Kích hoạt nút action ở phía góc
  toggleAction () {

    let flag = false;

    forEach(this.state.listPackage, (itemGroup, indexGroupBy1) => {
      forEach(itemGroup.items, (item, index1) => {
        if (item.checked) {
          flag = true
        }
      })
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

  // Thực hiện Lưu gói F2
  confirmF2Group () {
    this.setState({
      ...this.state, loadingModal: true
    });
    // Lấy danh sách các ID cần nhóm
    let list_package = [] // Danh sách ID các FX cần nhóm
    let total_weight = 0; // Tổng trọng lượng
    let total_product_convert_weight = 0; // Tổng trọng quy đổi
    let total_cost_main = 0; // Tổng cước chính
    let total_cost_add = 0; // Tổng dịch vụ cộng thêm

    let indexGroupBy = -1;
    let index = -1;

    forEach(this.state.listPackage, (itemGroup, indexGroupBy1) => {
      forEach(itemGroup.items, (item, index1) => {
        if (item.checked && item.type_package_app === 1) {
          list_package.push(item.id)
          total_weight                 += item.product_weight
          total_product_convert_weight += item.product_convert_weight
          total_cost_main              += item.cost_main
          total_cost_add               += item.cost_add

          indexGroupBy = indexGroupBy1
          index = index1;
        }
      })
    })

    let data = {
      "from_department_id": this.props.accountState.workDepartment.department_id,
      "to_department_id": this.state.listPackage[indexGroupBy].items[index].to_department_id,
      "total_weight": total_weight,
      "total_product_convert_weight": total_product_convert_weight,
      "total_cost_main": total_cost_main,
      "total_cost_add": total_cost_add,
      "list_package": list_package
    }

    axios.post('local_f2_group', data).then(response => {
      this.setState({
        ...this.state, ...{
          loadingModal: false
        }
      });
      console.log(response);
      setTimeout(() => {
        if (response.Status == 1) {
          if (!this.isCancelled) {
            this.setState({
              ...this.state, ...{
                modalVisible: false,
              }
            });
            this.dropdown.alertWithType('success', 'Thành công', 'Nhóm F2 thành công');
            this.fetchLocalF2GetListPackageToGroup()
          }
        } else {
          alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
        }
      }, 350)
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

  // Phần Seach
  doWork2 (items) {
    let flag = false; // Toàn bộ hide = 1
    forEach(items, (item, index) => {
      // Có 1 cái hide = 0 thì
      if (item.checked) {
        flag = true
      }

    })
    return flag ? true : false;
  }

  // FLATLIST
  handleRefresh = () => {
    this.dropdown.alertWithType('info', 'Thành công', 'Làm mới dữ liệu thành công !');
    this.fetchLocalF2GetListPackageToGroup(false)
  }

  handleRenderItem = ({item, index}) => {
    return (
      <View key={item.department_to}>
        <View style={{ backgroundColor: '#e5e5e5', paddingLeft: 10, height: 30, alignItems: 'center', flexDirection: 'row' }}>
          <MaterialCommunityIcons name='map-marker-radius' size={ 20 } color='#000' />
          <Text style={{ fontSize: 13, paddingLeft: 8, fontWeight: 'bold' }}>
            { item.department_to }
          </Text>
        </View>
        {
          item.items.map((item2, index2) => {
            if (!item2.hide) {
              return (
                <TouchableOpacity key={item2.barcode} onPress={() => this.selectPackage(index, index2) }>
                  <View style={{ height: 70, borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', marginRight: 10, marginLeft: 10, justifyContent: 'space-between' }}>

                    <View style={{ display: 'flex', flexDirection: 'row', alignItems:'center', flex: 60 }}>
                      {
                        item2.checked ?
                          <MaterialCommunityIcons name='check-circle' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                        :
                        <MaterialCommunityIcons name='checkbox-blank-circle-outline' size={ 22 } color='#000' style={{ marginRight: 5 }} />
                      }
                      <View style={{ display: 'flex', flexDirection: 'column', marginLeft: 5 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{ item2.barcode }</Text>
                        <Text style={{ marginTop: 4, fontSize: 13, color: '#4a4a4a' }}>{ item2.product_name } - { item2.product_weight } kg</Text>
                      </View>
                    </View>

                    <View style={{ flex: 40, alignItems: 'flex-end', flexDirection: 'column' }}>
                      <Text style={{ fontSize: 12 }}>{ item2.time_wait }</Text>
                      <MaterialCommunityIcons style={{ marginTop: 8, color: item2.color_app }} name='checkbox-blank-circle' size={ 14 } />
                    </View>

                  </View>
                </TouchableOpacity>
              )
            }
          })
        }
      </View>
    )
  }



  render() {
    const DeviceWidth = Dimensions.get('window').width - 150
    return (
      <View style={styles.container}>
        <View style={{ height: 50, alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row' }}>
          <TouchableOpacity  onPress={ () => this.props.navigation.navigate('DashboradStack') } >
            <View style={{ height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 40 }}>
                <MaterialIcons name='navigate-before' size={ 35 } color='#000' style={{ fontWeight: 'bold' }} />
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Nhóm F2</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={ () => this.openModal() }>
            <View style={{ minWidth: 75, height: 50, paddingRight: 10, justifyContent: 'center', display: 'flex' }}>
              {
                this.state.showAction == 1 &&
                <Text style={{ fontSize: 15, color: '#000', fontWeight: 'bold' }}>Xác nhận</Text>
              }
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
            <Ionicons name='ios-search' size={ 16 } color='#000' style={{ position: 'absolute', top: 16, left: 15, color: 'rgba(0,0,0,0.5)' }} />
            <TouchableOpacity onPress={ () => this.clearText() }>
              <View style={{ width: this.state.showCancel ? 60 : 0, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#000' }}>Xóa</Text>
              </View>
            </TouchableOpacity>
        </View>
        {
          this.state.loading &&
          <Spinner color='#22409A' size='small' style={{ paddingRight: 15 }} />
        }
       <View style={{ flex: 1, backgroundColor: '#fff' }}>
          {
            this.state.listPackage &&
            <FlatList
              data={this.state.listPackage}
              keyExtractor={item => item.department_to.toString()}
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
              onEndReachedThreshold={0.5}
              extraData={this.state}
              renderItem={this.handleRenderItem}
            >
            </FlatList>
          }
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {}}>
          <View style={{ backgroundColor: '#fff', flex: 1, paddingTop: Platform.OS === 'ios' ? (isIphoneXorAbove() ? 44 : 20) : 0 }}>
            <Loader loading={ this.state.loadingModal } />
            <View style={{ height: 44, alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row', paddingLeft: 10, paddingRight: 10 }}>
              <TouchableOpacity onPress={ () => this.setState({
                  modalVisible: false
                })}>
                <View style={{ height: 44, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 40 }}>
                    <MaterialIcons name='navigate-before' size={ 35 } color='#000' style={{ fontWeight: 'bold' }} />
                  </View>
                </View>
              </TouchableOpacity>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Xác nhận nhóm F2</Text>
              <TouchableOpacity onPress={ () => this.confirmF2Group() }>
                <View style={{ height: 44, paddingRight: 10, justifyContent: 'center', display: 'flex' }}>
                  <Text style={{ fontSize: 15, color: '#000', fontWeight: 'bold' }}>Đồng ý</Text>
                </View>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={{ paddingTop: 10 }}>
                {
                  this.state.listPackage.map((groupBy, indexGroupBy) => {
                    return (
                      <View key={groupBy.department_to}>
                        {
                          this.doWork2(groupBy.items) &&
                          <View style={{ backgroundColor: '#e5e5e5', paddingLeft: 10, height: 30, alignItems: 'center', flexDirection: 'row' }}>
                            <MaterialCommunityIcons name='map-marker-radius' size={ 20 } color='#000' />
                            <Text style={{ fontSize: 13, paddingLeft: 8, fontWeight: 'bold' }}>
                              { groupBy.department_to }
                            </Text>
                          </View>
                        }
                        {
                          groupBy.items.map((item, index) => {
                            if (item.checked) {
                              return (
                                <TouchableOpacity key={item.barcode}>
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
          </View>
        </Modal>
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

export default connect(mapStateToProps, null)(F2GroupScreen);
