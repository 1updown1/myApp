/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    ActivityIndicator,
    AlertIOS,
    Dimensions,
    ListView,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import request from '../util/request.js';
import config from '../util/config.js';
import Detail from './Detail.js';

var widths = Dimensions.get('window').width;

class Row extends Component {
    constructor(props){
        super(props);
        this.state = {
            row:this.props.row,
            like:false
        }
    }
    liked(){
        console.log('like执行');
        var url = config.api.base+config.api.up;
        request.get(url)
            .then((data) =>{
                console.log(data);
                if(data.success){
                    // AlertIOS.prompt('点赞成功')
                    AlertIOS.alert('点赞成功')
                    this.setState({like:!this.state.like})
                }else{
                    AlertIOS.alert('点赞失败')
                }
            })
    }

    push() {
        // let _this = this;
        this.props.onSelect(this.state.row);
    }

    render(){
        var row = this.state.row;
        return (<TouchableHighlight onPress={this.push.bind(this)}>
                    <View style={styles.items}>
                        <View style={styles.headBox}>
                            <Image source={{uri:row.author.avatar}} style={styles.touxiang}/>
                            <Text style={styles.nickname}>{row.author.nickname}</Text>
                        </View>
                        <Text style={styles.title}>{row.title}</Text>
                        <Image
                            style={styles.images}
                            source={{uri:row.thumb}}
                        >
                            <Icon name="ios-play" size={28} style={styles.play}/>
                        </Image>

                        <View style={styles.itemFooter}>
                            <TouchableHighlight onPress={this.liked.bind(this)} activeOpacity={1}>
                                <View style={styles.footerBox} >
                                    <Icon style={[styles.footerIcon,this.state.like?styles.like:null]} name={this.state.like?'ios-heart':'ios-heart-outline'} size={28}/>
                                    <Text style={styles.footerText}>喜欢</Text>
                                </View>
                            </TouchableHighlight>
                            <TouchableHighlight activeOpacity={1}>
                                <View style={styles.footerBox}>
                                    <Icon style={styles.footerIcon} name='ios-chatboxes-outline' size={28}/>
                                    <Text style={styles.footerText}>评论</Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                    </View>
                </TouchableHighlight>)
    }
}

export default class Video extends Component {
    constructor(props){
        super(props);
        console.log(this.props);
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows([]),
            page:0,
            list:[],
            total:0,
            isLoading:false
        };
    }
    fetchData(page) {
        // fetch('http://rap.taobao.org/mockjs/8207/lck/videoList')
        // fetch('http://rap.taobao.org/mockjs/13603/myapp/videoList')
        //     .then((response) => response.json())
        //     .then((responseJson) => {
        //         console.log(responseJson);
        //         var data = Mock.mock(responseJson);
        //         console.log(data);
        //         if(data.success){
        //             this.setState({dataSource:this.state.dataSource.cloneWithRows(data.data)})
        //         }
        //     })
        //     .catch((error) => {
        //         console.error(error);
        //     });

        this.setState({isLoading:true});
        var url = config.api.base + config.api.videoList;
        request.get(url,{
            accessToken:'lcks',
            page:page
        }).then((data) => {
            if(data.success){
                var list = this.state.list;
                if(page != 0){
                    for(var i=0;i<data.data.length;i++){
                        list.push(data.data[i])
                    }
                }else{
                    list = data.data;
                }
                page++;

                this.setState({
                    list:list,
                    dataSource:this.state.dataSource.cloneWithRows(list),
                    page:page,
                    total:data.total,
                    isLoading:false
                })
            }
        }).catch((error) => {
            console.error(error);
        });
    }
    fetchMore(){
        if(!this.needLoadMore() && !this.state.isLoading){
            this.fetchData(this.state.page)
        }
    }

    needLoadMore(){
        return (this.state.total >0 && this.state.total <= this.state.list.length)
    }

    componentDidMount() {
        this.fetchData(0);
    }



    loadPage(row){
        // console.log(this);
        this.props.navigator.push({
            name:'detail',
            component:Detail,
            params:row
        })
    }




    onRefresh() {
        console.log('刷新成功');
        this.fetchData(0)
    }
    renderFooter(){
        {
            if(this.needLoadMore()){
                return (<View><Text style={{textAlign:'center',fontSize:25,marginTop:18}}>木有更多了</Text></View>)
            }else{
                return (<View>
                        <ActivityIndicator
                            animating={true}
                            style={{height: 80}}
                            size="large"
                            color='orange'
                        />
                    </View>)
            }
        }

    }
    renderRow(row) {
        return (<Row row={row} onSelect={this.loadPage.bind(this)}></Row>)
    }

    render() {
        return (<View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headderTitle}>我勒个去</Text>
                    </View>
                    {/*<Text>hello.我是Video</Text>*/}
                    <ListView
                        dataSource={this.state.dataSource}  //数据源
                        renderRow={this.renderRow.bind(this)}   //渲染方法
                        renderFooter = {this.renderFooter.bind(this)}   //渲染数据底部的方法，常添加小菊花
                        automaticallyAdjustContentInsets={false}    //自动调整头部的空白
                        enableEmptySections={true}  //允许空白的数据源
                        onEndReached = {this.fetchMore.bind(this)}  //上滑加载更多数据
                        onEndReachedThreshold = {20}    //多少距离算到达底部
                        refreshControl={    //下滑刷新数据
                            <RefreshControl
                                refreshing={false}  //是否正在刷新
                                onRefresh={this.onRefresh.bind(this)}   //刷新所执行的方法
                                tintColor="gray"
                                title="Loading..."
                                titleColor="gray"
                                colors={['#ff0000', '#00ff00', '#0000ff']}
                                progressBackgroundColor="#ffff00"
                            />
                        }
                    />
                </View>);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#DEF9FF'
    },
    items:{
        width:widths,
        backgroundColor:'white',
        marginBottom:5
    },
    headBox:{
        marginTop:5,
        paddingTop:5,
        backgroundColor:'white',
        flexDirection:'row',
        flexWrap:'nowrap',
        justifyContent: 'flex-start'
    },
    touxiang:{
        width:20,
        height:20,
        borderRadius:10,
        marginLeft:10,
        marginRight:5
    },
    nickname:{
        height:20,
        lineHeight:20
    },
    title:{
        padding:10,
        fontSize:18,
        color:'black'
    },
    play:{
        position:'absolute',
        bottom:14,
        right:14,
        width:46,
        height:46,
        paddingTop:9,
        paddingLeft:18,
        backgroundColor:'transparent',
        borderColor:'white',
        borderWidth:1,
        borderRadius:23,
        color:'skyblue'
    },
    images:{
        width: widths,
        height: widths*0.5,
        resizeMode:'cover'
    },
    header:{
        paddingTop:22,
        paddingBottom:8,
        backgroundColor:'orange'
    },
    headderTitle:{
        textAlign:'center',
        color:'white'
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },

    itemFooter:{
        marginTop:5,
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'lightgray'
    },
    footerBox:{
        padding:5,
        flexDirection:'row',
        width:widths*0.5-0.5,
        justifyContent:'center',
        backgroundColor:'white'
    },
    footerText:{
        paddingLeft:12,
        paddingTop:4,
        fontSize:18,
        backgroundColor:'white'
    },
    footerIcon:{
        color:'red'
    },
    like:{
        color:'red'
    }
});
