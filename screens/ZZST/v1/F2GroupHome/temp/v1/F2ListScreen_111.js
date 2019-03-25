import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Platform, StatusBar, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';

import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Spinner } from 'native-base';

import { Checkbox } from 'react-native-paper';

import axios from "../../axios"
import { connect } from 'react-redux';
import { findIndex, forEach } from 'lodash'

class F2ListScreen extends Component {

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      loading: false,
      f2ListPackageToGroup: []
    };
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
    var res = barcode.substring(1, 2);
    if (res == 2) {
      type = 2
    }
    if (res == 3) {
      type = 3
    }
    return type
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ height: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row' }}>
          <TouchableOpacity  onPress={ () => this.props.navigation.navigate('DashboradStack') } >
            <View style={{ minWidth: 75, height: 50, paddingLeft: 15, justifyContent: 'center', display: 'flex' }}>
              <MaterialIcons name='close' size={26} color='#535c68' />
            </View>
          </TouchableOpacity>
          <Text style={{ color: '#212121', fontSize: 15, letterSpacing: 0 }}>
            DANH SÁCH F2
          </Text>
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
                    <TouchableOpacity key={item.barcode}>
                      <View
                        style={{ height: 90, backgroundColor: item.checked ? '#4ADFD0' : '#fff', borderBottomWidth: 1, borderColor: '#F3F3F3', display: 'flex', flexDirection: 'row', alignItems:'center', paddingRight: 10, paddingLeft: 1 }}>
                        <View style={{ width: 3, height: 88, backgroundColor: item.color_app, marginRight: 10 }}></View>
                        <View style={{ display: 'flex', flexDirection: 'column' }}>
                          <Text>{ item.barcode }</Text>
                          <Text style={{ marginTop: 5, fontSize: 13 }}>Đến: { item.department_to }</Text>
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
