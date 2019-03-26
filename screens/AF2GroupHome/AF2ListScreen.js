import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text, View, Button, Platform, StatusBar, TouchableOpacity} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import axios from "../../axios"
import { isIphoneXorAbove } from "../../filters";


class AF2ListScreen extends Component {

  constructor(props) {
    super(props);
    this.detailClick = this.detailClick.bind()
    this.state = {
      refreshing: false,
      reload: 0,
      listData: []
    };
  }

  componentDidMount() {
    this.fetchData()
  }

  detailClick = (item) => () => {
    this.props.navigation.navigate('AF2DetailScreen', {
      'item': item
    })
  }

  fetchData () {
    let data = {
      "department_id": 377
    }
    axios.post('local_f2_get_list_package_to_group', data).then(response => {
      if (response.Status == 1) {
        this.setState({
          ...this.state, listData: response.Data
        });
      }
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: 1, padding: 20}}>

        <TouchableOpacity  onPress={ () => this.props.navigation.navigate('DashboradStack') } >
            <View style={{ height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40 }}>
                <MaterialIcons name='navigate-before' size={ 35 } color='#000' style={{ fontWeight: 'bold' }} />
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Nhóm AF2</Text>
            </View>
          </TouchableOpacity>

        <ScrollView style={{flex: 1}}>
          {
            this.state.listData.map((item) => {
              return (
                <View key={item.barcode} style={{flex: 1}}>
                  <TouchableOpacity style={styles.touchableOpacity} onPress={this.detailClick(item)}>
                    <View style={{flex: 85}}>
                      <Text style={{fontWeight: '500'}}>{item.barcode}</Text>
                      <Text>{item.product_name}</Text>
                    </View>
                    <View style={{flex: 15}}>
                      <Text>{item.time_wait}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                )
            })
          }
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? (isIphoneXorAbove() ? 44 : 20) : StatusBar.currentHeight
  },
  touchableOpacity: {
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomColor: '#000',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center'
  }
});

export default AF2ListScreen;
