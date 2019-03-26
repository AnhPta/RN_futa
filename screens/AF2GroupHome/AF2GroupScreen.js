import React, { Component } from 'react';
import { Alert, SectionList, FlatList, ScrollView, StyleSheet, Text, View, Button, Platform, StatusBar, TouchableOpacity, Image} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import axios from "../../axios"
import { isIphoneXorAbove } from "../../filters";
import { chain, groupBy, map, get, find, value, mapValues, omit } from "lodash";


class AF2ListScreen extends Component {

  constructor(props) {
    super(props);
    this.changeChecked = this.changeChecked.bind()
    this.toggleAction = this.toggleAction.bind()
    // this.changeShowGroup = this.changeShowGroup.bind()
    this.groupF2 = this.groupF2.bind()
    this.state = {
      listData: [],
      checked: 0,
      showGroup: 0
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  changeChecked = (item) => () => {
    item.checked = !item.checked
    this.setState({
      ...this.state, ...{
        listData: this.state.listData
      }
    });
    this.toggleAction()
  }

  toggleAction = () => {
    let flag = 0
    this.state.listData.forEach(function(item) {
      item.data.forEach(function(child) {
        if (child.checked == 1) {
          flag = 1
        }
      })
    });

    this.setState({
      ...this.state, ...{
        showGroup: flag
      }
    });
  }

  fetchData () {
    let data = {
      "department_id": 377
    }
    // let temp = []
    // for (let i = 0; i < 100; i++) {
    //   let child = []
    //   for (let j = 0; j < 300; j++) {
    //     let obj = {
    //       'barcode': Math.floor(Math.random() * 1000) + 1,
    //       'product_name': 'a',
    //       'time_wait': '00h'
    //     }
    //     child.push(obj)
    //   }

    //   let key = {
    //     'department_to': Math.floor(Math.random() * 1000) + 1,
    //     'data': child
    //   }

    //   temp.push(key)
    // }

    // this.setState({
    //   ...this.state, listData: temp
    // });

    axios.post('local_f2_get_list_package_to_group', data).then(response => {
      console.log(response)
      if (response.Status == 1) {
        let temp = response.Data
        temp.map((item) => {
          item.checked = 0
          return item
        })
        var result=chain(temp).groupBy("department_to").map(function(v, i) {
          return {
            department_to: i,
            data: map(v)
          }
        }).value();
        console.log(result)

        this.setState({
          ...this.state, listData: result
        });
      }
    })
  }

  groupF2 () {
    Alert.alert(
    'Thông báo',
    'Xác nhận nhóm?',
    [
      {text: 'OK', onPress: () => console.log('OK')},
      {
        text: 'Hủy',
        onPress: () => console.log('Hủy'),
        style: 'cancel',
      },
    ],
    {cancelable: false},
  );
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: 1, paddingTop: 20, paddingBottom: 20}}>
          <View style={{ height: 50, alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexDirection: 'row' }}>
          <TouchableOpacity  onPress={ () => this.props.navigation.navigate('DashboradStack') } >
              <View style={{ height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40 }}>
                  <MaterialIcons name='navigate-before' size={ 35 } color='#000' style={{ fontWeight: 'bold' }} />
                </View>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Nhóm F2</Text>
              </View>
            </TouchableOpacity>
            {
              this.state.showGroup === 1 &&
              <TouchableOpacity onPress={ () => this.groupF2() }>
                <View style={{ minWidth: 75, height: 50, paddingRight: 10, justifyContent: 'center', display: 'flex' }}>
                    <Text style={{ fontSize: 15, color: '#000', fontWeight: 'bold' }}>Nhóm F2</Text>
                </View>
              </TouchableOpacity>
            }
          </View>

          <SectionList
            style={{flex: 1}}
            sections={this.state.listData}
            renderSectionHeader={({section}) =>
              <View style={{display: 'flex', backgroundColor: '#eee', height: 25, justifyContent: 'center', fontWeight: 'bold', paddingLeft: 15}}>
                <Text>{section.department_to}</Text>
              </View>
            }
            renderItem={({item}) =>
              <View key={item.barcode} style={{flex: 1}}>
                <TouchableOpacity
                style={styles.touchableOpacity}
                onPress={this.changeChecked(item)}
                >
                  <View style={{flex: 10, justifyContent: 'center', alignItems: 'center'}}>
                  {
                    item.checked ?
                    <Image style={styles.img} source={{uri: 'https://static.thenounproject.com/png/195060-200.png'}} />
                    :
                    <Image style={styles.img} source={{uri: 'http://www.sclance.com/pngs/radio-button-png/radio_button_png_1130468.png'}} />
                  }
                  </View>

                  <View style={{flex: 75}}>
                    <Text style={{fontWeight: '500'}}>{item.barcode}</Text>
                    <Text>{item.product_name}</Text>
                  </View>
                  <View style={{flex: 15}}>
                    <Text>{item.time_wait}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            }
            keyExtractor={(item, index) => index}
          />
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
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  img: {
    height: 20,
    width: 20
  }
});

export default AF2ListScreen;
