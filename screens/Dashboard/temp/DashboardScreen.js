import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Platform, StatusBar, ScrollView, Image, TouchableOpacity, AsyncStorage, Alert } from 'react-native';
import { Dimensions } from 'react-native'
const DeviceWidth = Dimensions.get('window').width - 45

import { isIphoneX } from "../../filters";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Spinner } from 'native-base';

import axios from "../../axios"
import { Font } from 'expo';

//REDUX
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { accountSetInfoUser, accountRemoveInfoUser, accountSetWorkDepartment } from '../Account/redux/action';


import RNPrint from 'react-native-print';

class DashboardScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      userWorkDepartment: {}
    };
  }

  componentDidMount() {
    this.fetchInfoUser()
    this._retrieveUserWorkDepartment()
  }

  _retrieveUserWorkDepartment = async () => {
    try {
      const value = await AsyncStorage.getItem('userWorkDepartment');
      if (value !== null) {
        var userWorkDepartment = JSON.parse(value);
        this.setState({
          ...this.state, userWorkDepartment: userWorkDepartment
        });
        this.props.accountSetWorkDepartment(userWorkDepartment)
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  // Lấy thông tin User đang đăng nhập
  fetchInfoUser () {
    console.log('Tải mới thông tin user')
    this.setState({
      ...this.state, loading: true
    });

    axios.get('getuserinfo').then(response => {
      this.setState({
        ...this.state, loading: false
      });
      if (response.Status) {
        this.props.accountSetInfoUser(response.Data)
      }
    })

  }

  // Đăng xuất
  _confirmSignOut() {
    Alert.alert(
      'Thông báo',
      'Đăng xuất khỏi hệ thống',
      [
        {text: 'Hủy', onPress: () => {}, style: 'cancel'},
        {text: 'OK', onPress: () => {
          this._signOutAsync()
        }},
      ],
      { cancelable: false }
    )
  }

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.accountRemoveInfoUser()
    this.props.navigation.navigate('AuthLoading');
  };


  async printHTML() {
   await Expo.Print.printAsync({
      html: '<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>'
    })
  }

  async printRemotePDF() {
    await RNPrint.print({ filePath: 'https://graduateland.com/api/v2/users/jesper/cv' })
  }

  customOptions = () => {
    return (
      <View>
        {this.state.selectedPrinter &&
          <View>
            <Text>{`Selected Printer Name: ${this.state.selectedPrinter.name}`}</Text>
            <Text>{`Selected Printer URI: ${this.state.selectedPrinter.url}`}</Text>
          </View>
        }
      <Button onPress={this.selectPrinter} title="Select Printer" />
      <Button onPress={this.silentPrint} title="Silent Print" />
    </View>

    )
  }


  render() {
    return (
      <View style={styles.container}>
        <View style={{ height: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#212121', fontSize: 17, letterSpacing: 2 }}>
            FUTA EXPRESS
          </Text>
        </View>
        <ScrollView style={{ paddingRight: 15, paddingTop: 15 }}>
          <View style={{
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'center',
            paddingBottom: 15
          }}>
            <View>
              <TouchableOpacity activeOpacity={0.4} onPress={() => this.props.navigation.navigate('F2GroupBottomTabNavigation')} >
                <View style={{ width: DeviceWidth * 0.5, height: DeviceWidth * 0.5, marginBottom:15, marginLeft:15, backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', flex: 1,justifyContent: 'center',alignItems: 'center' }}>
                  <MaterialCommunityIcons name='arrange-bring-forward' size={30} color='#535c68' />
                  <Text style={{ marginTop: 10, color: '#212121', fontSize: 15 }}>Nhóm F2</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.4}>
                <View style={{ width: DeviceWidth * 0.5, height: DeviceWidth * 0.5, marginBottom:15, marginLeft:15, backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', flex: 1,justifyContent: 'center',alignItems: 'center' }}>
                  <MaterialCommunityIcons name='bus-clock' size={35} color='#535c68' />
                  <Text style={{ marginTop: 10, color: '#212121', fontSize: 15 }}>Lịch tài</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity activeOpacity={0.4} onPress={() => this.props.navigation.navigate('F3GroupBottomTabNavigation')}>
                <View style={{ width: DeviceWidth * 0.5, height: DeviceWidth * 0.5, marginBottom:15, marginLeft:15, backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', flex: 1,justifyContent: 'center',alignItems: 'center' }}>
                  <MaterialCommunityIcons name='hexagon-multiple' size={35} color='#535c68' />
                  <Text style={{ marginTop: 10, color: '#212121', fontSize: 15 }}>Nhóm F3</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.4} onPress={() => this._confirmSignOut()}>
                <View style={{ width: DeviceWidth * 0.5, height: DeviceWidth * 0.5, marginBottom:15, marginLeft:15, backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', flex: 1,justifyContent: 'center',alignItems: 'center' }}>
                  <MaterialCommunityIcons name='exit-to-app' size={35} color='#535c68' />
                  <Text style={{ marginTop: 10, color: '#212121', fontSize: 15 }}>Đăng xuất</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <View style={styles.container}>
                {Platform.OS === 'ios' && this.customOptions()}
                <Button onPress={this.printHTML} title="Print HTML" />
                <Button onPress={this.printRemotePDF} title="Print Remote PDF" />
              </View>
        <View style={{ paddingLeft: 15, paddingBottom: 5, paddingTop: 3 }}>
          {
            this.props.accountState.accountInfo.id &&
            <Text style={{ fontSize: 13 }}>{ this.props.accountState.accountInfo.username }/{ this.props.accountState.accountInfo.fullname } || { this.state.userWorkDepartment.name }/{ this.state.userWorkDepartment.department_id }</Text>
          }
          {
            this.state.loading &&
            <Spinner color='#22409A' size='small' style={{ paddingRight: 15 }} />
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    paddingTop: 22
  }
});

const mapStateToProps = state => ({
  accountState: state.accountState
});

const mapDispatchToProps = dispatch => (
  bindActionCreators(
    {
      accountSetInfoUser,
      accountRemoveInfoUser,
      accountSetWorkDepartment
    }, dispatch
  )
);

export default connect(mapStateToProps, mapDispatchToProps)(DashboardScreen);
