import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Platform, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { Dimensions } from 'react-native'
const DeviceWidth = Dimensions.get('window').width - 45

import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

class F2GroupHomeScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ height: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row' }}>
          <TouchableOpacity  onPress={ () => this.props.navigation.goBack(null) } >
            <View style={{ minWidth: 75, height: 50, paddingLeft: 15, justifyContent: 'center', display: 'flex' }}>
              <MaterialIcons name='arrow-back' size={26} color='#535c68' />
            </View>
          </TouchableOpacity>
          <Text style={{ color: '#212121', fontSize: 17, letterSpacing: 2 }}>
            F2
          </Text>
          <View style={{ minWidth: 75, height: 50 }}>

          </View>
        </View>
        <ScrollView style={{ paddingRight: 15, paddingTop: 15 }}>
          <View style={{
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 15
          }}>
            <View>
              <TouchableOpacity activeOpacity={0.4} onPress={() => this.props.navigation.navigate('F2GroupScreen')}>
                <View style={{ width: DeviceWidth * 0.5, height: DeviceWidth * 0.5, marginBottom:15, marginLeft:15, backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', flex: 1,justifyContent: 'center',alignItems: 'center' }}>
                  <MaterialCommunityIcons name='ungroup' size={30} color='#535c68' />
                  <Text style={{ marginTop: 10, color: '#212121', fontSize: 14 }}>Nhóm túi F2</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity activeOpacity={0.4} onPress={() => this.props.navigation.navigate('F2ListScreen')}>
                <View style={{ width: DeviceWidth * 0.5, height: DeviceWidth * 0.5, marginBottom:15, marginLeft:15, backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', flex: 1,justifyContent: 'center',alignItems: 'center' }}>
                  <MaterialCommunityIcons name='ungroup' size={30} color='#535c68' />
                  <Text style={{ marginTop: 10, color: '#212121', fontSize: 14 }}>Danh sách F2</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
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

export default F2GroupHomeScreen;
