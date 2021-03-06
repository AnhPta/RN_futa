import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Platform, StatusBar, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Dimensions , Keyboard} from 'react-native';

import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Spinner } from 'native-base';

import { Checkbox } from 'react-native-paper';
import DropdownAlert from 'react-native-dropdownalert';

import axios from "../../axios"
import { connect } from 'react-redux';
import { findIndex, forEach, chain, groupBy, map, filter } from 'lodash'
import { Audio } from 'expo';

import { checkColor, checkTypePackage, playSoundSuccess, playSoundFail } from "../Helper/Funtions"

class F2GroupScreen extends Component {

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      loading: false,
      modalVisible: false,
      listPackage: [],
      countText: 0,
      scanBarcodeStatus: 1,
    };
    this.audioPlayer = new Audio.Sound();
  }

  componentDidMount() {
    this.isCancelled = false;
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        console.log('dưqdq');
        this.clickStartScanBarcode();
      }
    );
    this.fetchLocalF2GetListPackageToGroup();
  }

  componentWillUnmount() {
    this.isCancelled = true;
    this.didFocusListener.remove();
    this.clickStartScanBarcode();
  }

  fetchLocalF2GetListPackageToGroup () {
    this.setState({
      ...this.state, loading: true
    });

    let data = {
      "department_id": this.props.accountState.workDepartment.department_id
    }
    axios.post('local_f3_get_list_package_to_group', data).then(response => {
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
          listPackageTemp = listPackageTemp.filter(function(val) { return val.type_package_app == 1 || val.type_package_app == 2  });

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
        listPackage: this.state.listPackage
      }
    });
  }

  clickStartScanBarcode () {
    this.setState({
      ...this.state, scanBarcodeStatus: 1
    });
    this.ref.focus();
    Keyboard.dismiss();
  }

  openModal () {
    // Kiểm tra đã có ít nhất
    let flag = false;

    forEach(this.state.listPackage, (itemGroup, indexGroupBy1) => {
      forEach(itemGroup.items, (item, index1) => {
        if (item.checked) {
          flag = true
        }
      })
    })
    if (!flag) {
      Alert.alert(
        'Thông báo',
        'Vui lòng chọn gói F1 cần nhóm'
      );
      return
    }
    this.setState({
      ...this.state, modalVisible: true
    });

  }

  // Thực hiện Lưu gói F2
  confirmF2Group () {
    // Lấy danh sách các ID cần nhóm
    let list_package = [] // Danh sách ID các FX cần nhóm

    let indexGroupBy = -1;
    let index = -1;

    forEach(this.state.listPackage, (itemGroup, indexGroupBy1) => {
      forEach(itemGroup.items, (item, index1) => {
        if (item.checked) {
          list_package.push(item.id)
          indexGroupBy = indexGroupBy1
          index = index1;
        }
      })
    })

    let data = {
      "from_department_id": this.props.accountState.workDepartment.department_id,
      "to_department_id": 328,
      "note": '131231',
      "list_package_id": list_package
    }

    console.log(data);
    axios.post('local_f3_group', data).then(response => {
      console.log(response)
      if (response.Status == 1) {
        if (!this.isCancelled) {
          this.setState({
            ...this.state, ...{
              modalVisible: false
            }
          });
          this.dropdown.alertWithType('success', 'Thành công', 'Nhóm F3 thành công');
          this.fetchLocalF2GetListPackageToGroup()
        }
      } else {
        alert('Có lỗi xảy ra. Vui lòng liên hệ admin')
      }
    })
  }

  render() {
    const DeviceWidth = Dimensions.get('window').width - 150
    return (
      <View style={styles.container}>
        <View style={{ height: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row' }}>
          <TouchableOpacity  onPress={ () => this.props.navigation.navigate('DashboradStack') } >
            <View style={{ minWidth: 75, height: 50, paddingLeft: 15, justifyContent: 'center', display: 'flex' }}>
              {/*<MaterialIcons name='arrow-back' size={26} color='#535c68' />*/}
              <MaterialIcons name='close' size={26} color='#535c68' />
            </View>
          </TouchableOpacity>
          <View style={{ width: DeviceWidth }}>
            <TextInput
              ref={ref => (this.ref = ref)}
              placeholder="Quét mã nhóm F3 ..."
              onChangeText={(text) => this.changeText(text)}
              onSubmitEditing={(event) => this.submitChangeText(event) }
              style={{height: 40, width: '100%', borderColor: '#ddd', borderWidth: 1.5, paddingLeft: 50, borderRadius: 3 }}/>
            <TouchableOpacity style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 0, left: 0 }} onPress={ () => this.clickStartScanBarcode() }>
              <MaterialCommunityIcons name='barcode-scan' size={20} color='#535c68' style={{ color: this.state.scanBarcodeStatus ? 'red' : '#535c68'  }} />
            </TouchableOpacity>
            <TouchableOpacity style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 0, right: 0 }} onPress={ () => this.clearText() }>
              <MaterialCommunityIcons name='close' size={20} color='#535c68' />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={ () => this.openModal() }>
            <View style={{ minWidth: 75, height: 50, paddingLeft: 15, justifyContent: 'center', display: 'flex' }}>
              <Text style={{ fontSize: 15, color: '#000' }}> Nhóm</Text>
            </View>
          </TouchableOpacity>
        </View>
        <ScrollView>
          {
            this.state.loading &&
            <Spinner color='#22409A' size='small' style={{ paddingRight: 15 }} />
          }
          <View style={{ paddingTop: 10 }}>
            {
              this.state.listPackage.map((groupBy, indexGroupBy) => {
                return (
                  <View key={indexGroupBy}>
                    <View style={{ backgroundColor: '#ccc', padding: 5 }}>
                      <Text>{ groupBy.department_to }</Text>
                    </View>
                    {
                      groupBy.items.map((item, index) => {
                        if (!item.hide) {
                          return (
                            <TouchableOpacity key={item.barcode} onPress={() => this.selectPackage(indexGroupBy, index) }>
                              <View style={{ height: 90, backgroundColor: item.checked ? '#4ADFD0' : '#fff', borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', paddingRight: 10, paddingLeft: 1, justifyContent: 'space-between' }}>

                                <View style={{ display: 'flex', flexDirection: 'row', alignItems:'center', flex: 60 }}>
                                  <View style={{ width: 3, height: 88, backgroundColor: item.color_app, marginRight: 5 }}></View>
                                  <Checkbox color='white' status={item.checked ? 'checked' : 'unchecked'} />
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
                        }
                      })
                    }
                  </View>
                )
              })
            }
          </View>
        </ScrollView>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {}}>
          <View style={{ backgroundColor: '#eeeeee', flex: 1 }}>
            <View style={{ height: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={ () => this.setState({
                  modalVisible: false
                })}>
                <View style={{ minWidth: 75, height: 50, paddingLeft: 15, justifyContent: 'center', display: 'flex' }}>
                  <MaterialIcons name='close' size={26} color='#535c68' />
                </View>
              </TouchableOpacity>
              <Text style={{ color: '#212121', fontSize: 15 }}>
                XÁC NHẬN NHÓM F2
              </Text>
              <TouchableOpacity onPress={ () => this.confirmF2Group() }>
                <View style={{ minWidth: 75, height: 50, paddingLeft: 15, justifyContent: 'center', display: 'flex' }}>
                  <Text style={{ fontSize: 17, color: '#000', fontWeight: 'bold' }}> Lưu</Text>
                </View>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={{ paddingTop: 10 }}>
                {
                  this.state.listPackage.map((groupBy, indexGroupBy) => {
                    return (
                      <View key={indexGroupBy}>
                        {
                          groupBy.items.map((item, index) => {
                            if (item.checked) {
                              return (
                                <TouchableOpacity key={item.barcode}>
                                  <View style={{ height: 90, backgroundColor: item.checked ? '#4ADFD0' : '#fff', borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', paddingRight: 10, paddingLeft: 1, justifyContent: 'space-between' }}>

                                    <View style={{ display: 'flex', flexDirection: 'row', alignItems:'center', flex: 60 }}>
                                      <View style={{ width: 3, height: 88, backgroundColor: item.color_app, marginRight: 5 }}></View>
                                      <Checkbox color='white' status={item.checked ? 'checked' : 'unchecked'} />
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
          defaultContainer={{padding: 8, paddingTop: Platform.OS === 'ios' ? 0 : 20, flexDirection: 'row'}}
          ref={ref => this.dropdown = ref} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    paddingTop: Platform.OS === 'ios' ? (isIphoneX() ? 44 : 22) : StatusBar.currentHeight
  }
});

const mapStateToProps = state => ({
  accountState: state.accountState
});

export default connect(mapStateToProps, null)(F2GroupScreen);
