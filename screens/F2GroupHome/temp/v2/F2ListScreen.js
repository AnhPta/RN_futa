import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Platform, StatusBar, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Dimensions } from 'react-native';

import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Spinner } from 'native-base';

import { Checkbox } from 'react-native-paper';

import axios from "../../axios"
import { connect } from 'react-redux';
import { findIndex, forEach } from 'lodash'
import { Audio } from 'expo';
import DropdownAlert from 'react-native-dropdownalert';

class F2ListScreen extends Component {

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      loading: false,
      f2ListPackageToGroup: []
    };
    this.audioPlayer = new Audio.Sound();
  }

  componentDidMount() {
    this.isCancelled = false;
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => { this.fetchLocalF2GetListPackageToGroup() },
    );

  }

  componentWillUnmount() {
    this.isCancelled = true;
    this.didFocusListener.remove();
  }

  fetchLocalF2GetListPackageToGroup () {
    this.setState({
      ...this.state, loading: true
    });

    let data = {
      "department_id": this.props.accountState.workDepartment.department_id
    }
    axios.post('local_f2_get_list_package_to_group', data).then(response => {
      if (response.Status == 1) {
        console.log('fetchLocalF2GetListPackageToGroup')

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
      return o.barcode === text.trim()
    })
    if (index >= 0) {
      let item = this.state.f2ListPackageToGroup[index];
      this._playSoundSuccess();
      this.getF2Detail(item)
    } else {
      this._playSoundFail()
      this.dropdown.alertWithType('warn', 'Có lỗi xảy ra ', 'Không thấy mã: ' + text);
    }
    this.ref.clear()
  }

  _playSoundSuccess = async () => {
    try {
      await this.audioPlayer.unloadAsync()
      await this.audioPlayer.loadAsync(require("../../assets/mp3/iphone.mp3"));
      await this.audioPlayer.playAsync();
    } catch (err) {
    }
  }

  _playSoundFail = async () => {
    try {
      await this.audioPlayer.unloadAsync()
      await this.audioPlayer.loadAsync(require("../../assets/mp3/fail.mp3"));
      await this.audioPlayer.playAsync();
    } catch (err) {
    }
  }

  getF2Detail (item) {
    this.props.navigation.navigate('F2DetailScreen', {
      'f2_item': item
    })
  }

  render() {
    const DeviceWidth = Dimensions.get('window').width - 150
    return (
      <View style={styles.container}>
        <View style={{ height: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row' }}>
          <TouchableOpacity  onPress={ () => this.props.navigation.navigate('DashboradStack') } >
            <View style={{ minWidth: 75, height: 50, paddingLeft: 15, justifyContent: 'center', display: 'flex' }}>
              <MaterialIcons name='close' size={26} color='#535c68' />
            </View>
          </TouchableOpacity>
          <View style={{ width: DeviceWidth }}>
            <TextInput
              ref={ref => (this.ref = ref)}
              placeholder="Quét mã tìm F2 ..."
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
          <View style={{ paddingTop: 10 }}>
            {
              this.state.f2ListPackageToGroup.map((item, index) => {
                if (item.type_package_app == 2) {
                  return (
                    <TouchableOpacity key={item.barcode} onPress={ () => this.getF2Detail(item)  }>
                      <View style={{ height: 90, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', paddingRight: 10, paddingLeft: 1, justifyContent: 'space-between' }}>

                        <View style={{ display: 'flex', flexDirection: 'row', alignItems:'center', flex: 65 }}>
                          <View style={{ width: 3, height: 88, backgroundColor: item.color_app, marginRight: 5 }}></View>
                          <View style={{ display: 'flex', flexDirection: 'column', marginLeft: 5 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{ item.barcode }</Text>
                            <Text style={{ marginTop: 5, fontSize: 11 }}>Đến: { item.department_to }</Text>
                          </View>
                        </View>

                        <View style={{ flex: 25, alignItems: 'center', flexDirection: 'column' }}>
                          <Text style={{ fontSize: 12 }}>{ item.product_weight } kg</Text>
                          <Text style={{ fontSize: 12 }}>{ item.quantity_total } kiện</Text>
                        </View>

                        <View style={{ flex: 10 }}>
                          <MaterialIcons name='navigate-next' size={24} color='#535c68' />
                        </View>
                      </View>
                    </TouchableOpacity>
                  )
                }
              })
            }
          </View>
          {
            this.state.loading &&
            <Spinner color='#22409A' size='small' style={{ paddingRight: 15 }} />
          }
        </ScrollView>
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

export default connect(mapStateToProps, null)(F2ListScreen);
