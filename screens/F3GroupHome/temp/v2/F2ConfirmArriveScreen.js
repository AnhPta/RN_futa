import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Platform, StatusBar, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Dimensions } from 'react-native';

import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Spinner } from 'native-base';

import { Checkbox } from 'react-native-paper';
import DropdownAlert from 'react-native-dropdownalert';

import axios from "../../axios"
import { connect } from 'react-redux';
import { findIndex, forEach } from 'lodash'

class F2ConfirmArriveScreen extends Component {

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      loading: false,
      modalVisible: false,
      f2ListPackageToGroup: []
    };
  }

  componentDidMount() {
    this.isCancelled = false;
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {  },
    );
    this.LocalF2GetListToConfirmArrive();
  }

  componentWillUnmount() {
    this.isCancelled = true;
    this.didFocusListener.remove();
  }

  LocalF2GetListToConfirmArrive () {
    this.setState({
      ...this.state, loading: true
    });

    let data = {
      "department_id": this.props.accountState.workDepartment.department_id
    }
    axios.post('local_f2_get_list_confirm_arrive', data).then(response => {
      if (response.Status == 1) {
        console.log('LocalF2GetListToConfirmArrive')
        console.log(response);
        if (!this.isCancelled) {
          // Gán thêm trường checked
          let _this = this
          let f2ListPackageToGroupTemp = response.Data

          f2ListPackageToGroupTemp.map(function(item) {
            item.checked = 0;
            item.color_app = _this.checkColor(item.color);
            item.type_package_app = _this.checkTypePackage(item.barcode);
            return item;
          })

          // Lưu
          this.setState({
            ...this.state, ...{
              loading: false,
              f2ListPackageToGroup: f2ListPackageToGroupTemp
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

  // Bắn sứng
  changeText (text) {
    let index = findIndex(this.state.f2ListPackageToGroup, function (o) {
      return o.barcode === text.trim() && o.type_package_app === 1
    })
    if (index >= 0) {
      let item = this.state.f2ListPackageToGroup[index];
      if (this.checkSameToDepartment(item)) {
        let f2ListPackageToGroupTemp = this.state.f2ListPackageToGroup;
        f2ListPackageToGroupTemp[index].checked = ! f2ListPackageToGroupTemp[index].checked;
        this.setState({
          ...this.state, f2ListPackageToGroup: f2ListPackageToGroupTemp
        });
        this._playSoundSuccess();
      } else {
        this._playSoundFail()
        this.dropdown.alertWithType('warn', 'Có lỗi xảy ra ', 'Danh sách hàng nhóm túi không cùng nơi đến');
      }
    } else {
      this._playSoundFail()
    }
    this.ref.clear()
  }

  selectPackage (index) {
    let item = this.state.f2ListPackageToGroup[index];
    if (!item.checked) {
      if (this.checkSameToDepartment(item)) {
        let f2ListPackageToGroupTemp = this.state.f2ListPackageToGroup;
        f2ListPackageToGroupTemp[index].checked = ! f2ListPackageToGroupTemp[index].checked;
        this.setState({
          ...this.state, f2ListPackageToGroup: f2ListPackageToGroupTemp
        });
      } else {
        this._playSoundFail()
        this.dropdown.alertWithType('warn', 'Có lỗi xảy ra ', 'Danh sách hàng nhóm túi không cùng nơi đến');
      }
    } else {
      let f2ListPackageToGroupTemp = this.state.f2ListPackageToGroup;
      f2ListPackageToGroupTemp[index].checked = ! f2ListPackageToGroupTemp[index].checked;
      this.setState({
        ...this.state, f2ListPackageToGroup: f2ListPackageToGroupTemp
      });
    }
  }

  checkSameToDepartment (item) {
    let packageSlected = [];
    forEach(this.state.f2ListPackageToGroup, (item) => {
        if (item.checked && item.type_package_app === 1) {
          packageSlected.push(item.to_department_id)
        }
    })
    if (packageSlected.length) {
      if (packageSlected.includes(item.to_department_id)) {
        return true;
      }
      return false
    }
    return true
  }

  _playSoundSuccess = async () => {
    const soundObject = new Expo.Audio.Sound();
    try {
      await soundObject.loadAsync(require('../../assets/mp3/iphone.mp3'));
      await soundObject.playAsync();
      // Your sound is playing!
    } catch (error) {
      // An error occurred!
    }
  }

  _playSoundFail = async () => {
    const soundObject = new Expo.Audio.Sound();
    try {
      await soundObject.loadAsync(require('../../assets/mp3/fail.mp3'));
      await soundObject.playAsync();
      // Your sound is playing!
    } catch (error) {
      // An error occurred!
    }
  }

  openModal () {
    // Kiểm tra đã có ít nhất
    let flag = false;
    forEach(this.state.f2ListPackageToGroup, (item) => {
        if (item.checked && item.type_package_app === 1) {
          flag = true
        }
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
    let total_weight = 0; // Tổng trọng lượng
    let total_product_convert_weight = 0; // Tổng trọng quy đổi
    let total_cost_main = 0; // Tổng cước chính
    let total_cost_add = 0; // Tổng dịch vụ cộng thêm

    forEach(this.state.f2ListPackageToGroup, (item) => {
        if (item.checked && item.type_package_app === 1) {
          list_package.push(item.id)
          total_weight                 += item.product_weight
          total_product_convert_weight += item.product_convert_weight
          total_cost_main              += item.cost_main
          total_cost_add               += item.cost_add
        }
    })
    // Lấy điểm đến tiếp theo, dựa vào bản ghi đầu tiên
    let index = findIndex(this.state.f2ListPackageToGroup, function (o) {
      return o.checked && o.type_package_app === 1
    })

    let data = {
      "from_department_id": this.props.accountState.workDepartment.department_id,
      "to_department_id": this.state.f2ListPackageToGroup[index].to_department_id,
      "total_weight": total_weight,
      "total_product_convert_weight": total_product_convert_weight,
      "total_cost_main": total_cost_main,
      "total_cost_add": total_cost_add,
      "list_package": list_package
    }

    axios.post('local_f2_group', data).then(response => {
      console.log(response)
      if (response.Status == 1) {
        if (!this.isCancelled) {
          this.setState({
            ...this.state, ...{
              modalVisible: false
            }
          });
          this.dropdown.alertWithType('success', 'Thành công', 'Nhóm F2 thành công');
          this.LocalF2GetListToConfirmArrive()
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
              placeholder="Quét mã dỡ F2 ..."
              onChangeText={(text) => this.changeText(text)}
              style={{height: 40, width: '100%', borderColor: '#ddd', borderWidth: 1.5, paddingLeft: 40, borderRadius: 3 }}/>
            <MaterialCommunityIcons style={{ position: 'absolute', top: 10, left: 10 }} name='barcode-scan' size={20} color='#535c68' />
          </View>
          <TouchableOpacity>
            <View style={{ minWidth: 75, height: 50, paddingLeft: 15, justifyContent: 'center', display: 'flex' }}>

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
              this.state.f2ListPackageToGroup.map((item, index) => {
                if (item.type_package_app == 1) {
                  return (
                    <TouchableOpacity key={item.barcode} onPress={() => this.selectPackage(index) }>
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
                  this.state.f2ListPackageToGroup.map((item, index) => {
                    if (item.checked == 1 && item.parent_id === 0) {
                      return (
                        <View
                          style={{ width: '100%', height: 80, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', paddingRight: 10, paddingLeft: 15 }}
                          key={item.barcode}>
                          <Text>{ item.barcode }</Text>
                        </View>
                      )
                    }
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

export default connect(mapStateToProps, null)(F2ConfirmArriveScreen);
