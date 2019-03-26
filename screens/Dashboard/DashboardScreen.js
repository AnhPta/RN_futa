import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Platform, StatusBar, ScrollView, Image, TouchableOpacity, AsyncStorage, Alert } from 'react-native';
import { Dimensions } from 'react-native'

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
    const DeviceWidth = Dimensions.get('window').width - 20
    return (
      <View style={styles.container}>
        <View style={{  height: 120, alignItems: 'center', justifyContent: 'center' }}>
          <Image
            resizeMode='contain'
            style={{ height: 50 }}
            source={require('../../assets/images/logo/futa-logo.png')}
          />
        </View>
        <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}>
          <Text style={{ fontSize: 25, fontWeight: 'bold', color: '#000', marginBottom: 20  }}>
            Chào, { this.props.accountState.accountInfo.fullname }.
          </Text>
          <Text style={{ textAlign: 'center', fontSize: 16, lineHeight: 22, letterSpacing: 1, paddingLeft: 25, paddingRight: 25,color: '#000' }}>
            FutaEx rất cảm ơn sự cố gắng ngày hôm nay bạn đóng góp. Chúc { this.props.accountState.accountInfo.fullname } 1 ngày mới vui vẻ.
          </Text>
        </View>
        <View style={{ flex: 1, paddingTop: 25 }}>
          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
              <TouchableOpacity activeOpacity={0.4} onPress={() => this.props.navigation.navigate('AF2GroupBottomTabNavigation')} >
                <View style={{ width: 100, height: 100, backgroundColor: '#f5f6f7', borderRadius: 5, justifyContent: 'center',alignItems: 'center' }}>
                  <MaterialCommunityIcons name='arrange-bring-forward' size={25} color='#535c68' />
                  <Text style={{ marginTop: 5, color: '#000', fontSize: 14, fontWeight: 'bold' }}>AF2</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
              <TouchableOpacity activeOpacity={0.4} onPress={() => this.props.navigation.navigate('F2GroupBottomTabNavigation')} >
                <View style={{ width: 100, height: 100, backgroundColor: '#f5f6f7', borderRadius: 5, justifyContent: 'center',alignItems: 'center' }}>
                  <MaterialCommunityIcons name='arrange-bring-forward' size={25} color='#535c68' />
                  <Text style={{ marginTop: 5, color: '#000', fontSize: 14, fontWeight: 'bold' }}>Nhóm F2</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
              <TouchableOpacity activeOpacity={0.4} onPress={() => this.props.navigation.navigate('F3GroupBottomTabNavigation')}>
                <View style={{ width: 100, height: 100, backgroundColor: '#f5f6f7', borderRadius: 5, justifyContent: 'center',alignItems: 'center' }}>
                  <MaterialCommunityIcons name='hexagon-multiple' size={25} color='#535c68' />
                  <Text style={{ marginTop: 5, color: '#000', fontSize: 14, fontWeight: 'bold' }}>Nhóm F3</Text>
                </View>
              </TouchableOpacity>
            </View>
{/*            <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ width: 100, height: 100, backgroundColor: '#f5f6f7', borderRadius: 5 }}>

              </View>
            </View>*/}
          </View>
        </View>
        <View style={{ height: 40, paddingLeft: 15 }}>
        {
          this.state.loading &&
          <Spinner color='#22409A' size='small' style={{ paddingRight: 15 }} />
        }
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
          {
            this.props.accountState.accountInfo.id &&
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 13 }}>{ this.state.userWorkDepartment.name }/{ this.state.userWorkDepartment.department_id }</Text>
            </View>
          }
          <TouchableOpacity onPress={() => this._confirmSignOut()}>
            <Text style={{ color: '#3498db', marginLeft: 10 }}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
        <View>
          <Text>v.30</Text>
        </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
