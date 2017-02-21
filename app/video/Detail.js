/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ListView,
    Image,
    Modal,
    TouchableOpacity,
    ProgressViewIOS,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import request from '../util/request.js';
import config from '../util/config.js';
import Video from 'react-native-video';
import Button from 'react-native-button';

var widths = Dimensions.get('window').width;
var heights = Dimensions.get('window').height;

export default class Detail extends Component {
    constructor(props){
        super(props);
        console.log(props);
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            list:[],
            row:this.props,
            dataSource: ds.cloneWithRows([]),
            page:0,
            total:0,
            videoTime:0,
            videoNowTime:0,
            videoProgress:0,
            paused:false,
            videoIsEnd:false,
            isLoading:false,
            modalVisible:false,
            myComment:''
        }
    }
    componentDidMount(){
        this.fetch(0);
    }
    fetch(page){
        this.setState({isLoading:true});
        var url = config.api.base + config.api.comment;
        request.get(url,{
            accessToken:'lcks',
            page:page
        }).then((data) => {
            console.log(data);
            if(data.success){
                var list = this.state.list;
                if(page != 0){
                    for(var i=0;i<data.data.length;i++){
                        list.push(data.data[i]);
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
        console.log('fetchMore');
        if(!this.state.isLoading && !this.needLoadMore()){
            this.fetch(this.state.page)
        }
    }
    publish(){
        var list = this.state.list;
        var myComment = this.state.myComment;
        list = [{content:myComment,replyBy:{avatar:'http://a.hiphotos.baidu.com/baike/w%3D268%3Bg%3D0/sign=78c93c0156e736d158138b0ea36b28ff/728da9773912b31b7096bff48418367adbb4e171.jpg',nickname:'updown'}}].concat(list);
        // list.push({content:myComment,replyBy:{avatar:'https://imgsa.baidu.com/baike/c0%3Dbaike272%2C5%2C5%2C272%2C90/sign=c4f298bb97ef76c6c4dff379fc7f969f/9358d109b3de9c82f077b3156b81800a19d8431d.jpg',nickname:'updown'}});
        console.log(list);
        this.setState({
            list:list,
            dataSource:this.state.dataSource.cloneWithRows(list),
            myComment:'',
            modalVisible:false
        })

    }
    updateMyText(val){
        this.setState({myComment:val});
    }



    onLoad(data){
        this.setState({videoTime:data.duration});
    }
    videoProgress(data){
        if(!this.state.videoIsEnd){
            var pg = this.state.videoNowTime/this.state.videoTime;
            this.setState({
                videoNowTime:data.currentTime,
                videoProgress:pg
            })
        }
    }
    paused () {
        if(this.state.videoIsEnd){
            this.player.seek(0);
            this.setState({
                videoIsEnd:false,
            });
        }
        this.setState({paused:!this.state.paused});
    }
    videoEnd(){
        this.setState({
            videoIsEnd:true,
            paused:true,
            videoProgress:1
        });
    }

    inputFocus(){
        this.setState({
            modalVisible:true
        })
    }
    pop(){
        this.props.navigator.pop();
    }
    needLoadMore(){
        return (this.state.total>0 && this.state.total <= this.state.list.length)
    }

    onRefresh(){
        this.fetch(0);
    }
    renderHeader(){
        return(<View>
            <TouchableOpacity onPress={this.paused.bind(this)}>
                <Video
                    ref={(ref) => {
                        this.player = ref
                    }}
                    source={{uri: this.state.row.video}}
                    resizeMode="cover"
                    style={styles.detailVideo}
                    onProgress={this.videoProgress.bind(this)}
                    onEnd={this.videoEnd.bind(this)}
                    onLoad={this.onLoad.bind(this)}
                    paused={this.state.paused}
                />
                {
                    this.state.paused ? <Icon name="ios-play" size={38} style={styles.play}/> : null
                }
                <View style={styles.progressBox}>
                    <View style={[styles.progress,{width:widths*this.state.videoProgress}]}></View>
                </View>
            </TouchableOpacity>
            {/*<ProgressViewIOS
                progressTintColor="orange"
                progress={this.state.videoProgress}
                trackTintColor="black"
            />*/}
            <View style={styles.container}>
                <Image source={{uri:this.state.row.author.avatar}} style={styles.dataImg}/>
                <View>
                    <View style={styles.dataNickname}>
                        <Text style={{fontSize:18}}>{this.state.row.author.nickname}</Text>
                    </View>
                    <View>
                        <Text style={styles.dataTitle}>{this.state.row.title}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.comment}>
                <Text>发表评论</Text>
                <TextInput
                    style={styles.inputText}
                    placeholder="下面说出你的故事"
                    multiline={true}
                    returnKeyType="go"
                    onFocus={this.inputFocus.bind(this)}
                />
                <Modal visible={this.state.modalVisible} transparent={false} style={{backgroundColor:'skyblue'}}>
                    {/*<Text>浮层</Text>*/}
                    {/*<Button onPress={() => this.setState({modalVisible:false})}>评论</Button>*/}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => this.setState({modalVisible:false})}>
                            <View style={styles.goBack}>
                                <Text style={styles.goBackText}>取消</Text>
                            </View>
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.mainText}>评论</Text>
                        </View>
                        <Button style={styles.subline_btn} onPress={this.publish.bind(this)}>发布</Button>
                    </View>
                    <TextInput
                        autoCorrect={false}
                        multiline={true}
                        placeholder='写下评论'
                        style={styles.modalInput}
                        onChangeText = {this.updateMyText.bind(this)}
                    />
                </Modal>
            </View>
        </View>)
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
    renderRow(row){
        return (<View style={styles.container}>
                    <Image source={{uri:row.replyBy.avatar}} style={styles.commentLogo}/>
                    <View>
                        <View style={styles.commentNickname}>
                            <Text>{row.replyBy.nickname}</Text>
                        </View>
                        <Text style={styles.commentText}>{row.content}</Text>
                    </View>
                </View>)
    }
    render() {
        return (<View style={{width:widths}}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={this.pop.bind(this)}>
                            <View style={styles.goBack}>
                                <Icon name="ios-arrow-back" size={20} color="gray"/>
                                <Text style={styles.goBackText}>返回</Text>
                            </View>
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.mainText}>视频详情页</Text>
                        </View>
                        <View style={{width:70,paddingRight:15}}></View>
                    </View>

                    <ListView
                        dataSource={this.state.dataSource}  //数据源
                        renderRow={this.renderRow.bind(this)}   //渲染方法
                        automaticallyAdjustContentInsets={false}    //自动调整头部的空白
                        enableEmptySections={true}  //允许空白的数据源
                        renderFooter = {this.renderFooter.bind(this)}
                        renderHeader={this.renderHeader.bind(this)}
                        onEndReachedThreshold = {20}
                        onEndReached = {this.fetchMore.bind(this)}
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
    header:{
        flexDirection:'row',
        justifyContent:'space-between',
        paddingTop:30,
        paddingBottom:10,
        backgroundColor:'skyblue',
    },
    goBack:{
        flexDirection:'row',
        paddingLeft:15,
        width:70,
    },
    goBackText:{
        color:'gray',
        lineHeight:16,
        paddingLeft:8,
        width:60,
        height:16,
        paddingBottom:25,
    },
    mainText:{
        fontSize:18,
    },
    detailVideo:{
        width:widths,
        height:200,
        margin:0,
        padding:0,
        // backgroundColor:'black'
    },
    play:{
        position:'absolute',
        top:100-28,
        left:widths*0.5-28,
        width:56,
        height:56,
        paddingTop:9,
        paddingLeft:20,
        backgroundColor:'transparent',
        borderColor:'white',
        borderWidth:1,
        borderRadius:28,
        color:'skyblue'
    },
    progressBox:{
        width:widths,
        height:3,
        backgroundColor:'black'
    },
    progress:{
        height:3,
        backgroundColor:'orange'
    },
    container: {
        paddingTop:10,
        paddingBottom:10,
        flexDirection:'row',
        justifyContent: 'flex-start',
        backgroundColor: 'white',
    },
    dataImg:{
        width:70,
        height:70,
        borderRadius:35,
        margin:10,
    },
    dataContent:{
        height:90
    },
    dataNickname:{
        paddingTop:7,
        paddingBottom:10,
        paddingRight:5
    },
    dataTitle:{
        color:'gray',
        fontSize:15,
        width:widths-95
    },
    comment:{
        width:widths,
        padding:10,
        backgroundColor:'white'
    },
    inputText:{
        width:widths-20,
        padding:5,
        height:60,
        borderWidth:1,
        borderColor:'gray',
        borderRadius:5,
        marginTop:5,
        fontSize:13
    },
    commentBox:{
        width:widths,
        paddingTop:10,
        paddingBottom:10
    },
    commentLogo:{
        width:50,
        height:50,
        margin:10,
        borderRadius:25
    },
    commentNickname:{
        paddingTop:8,
        paddingBottom:5
    },
    commentText:{
        width:widths-75,
        paddingRight:5
    },
    subline_btn:{
        width:70,
        paddingRight:15,
        paddingTop:0,
        paddingBottom:25,
        fontSize:14,
        color:'gray',
        lineHeight:22,
        height:18,
        fontWeight:'normal'
    },
    modalInput:{
        height:heights,
        borderWidth:1,
        padding:10,
        fontSize:16
    }
});
