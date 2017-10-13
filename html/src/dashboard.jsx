
import React from 'react'
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Grid, Row, Col, Button, Modal, OverlayTrigger, Popover, Tooltip, ButtonGroup, ToggleButtonGroup, ToggleButton, ButtonToolbar } from 'react-bootstrap';
import $ from 'jquery'
import ec from 'echarts'
import { DatePicker, Select, InputNumber } from 'antd';

const Option = Select.Option;
import moment from 'moment';

import Media from 'react-media'

const MAX_DATA_COUNT = 20;
const DAY = 24 * 60 * 60;
const BEIJING_TIME = 8 * 60 * 60;

const TIME_TYPE_DAY = 1;
const TIME_TYPE_MONTH = 2;
const TIME_TYPE_YEAR = 3;

const TIME_OFFSET = 8 * 60 * 60;

function fixTime(time) {
    time += TIME_OFFSET;
    time -= time % (24 * 60 * 60);
    time -= TIME_OFFSET;
    return time;
}
var maxUID = 0;
class SearchOption {
    constructor() {
        this.selectedName = [];
        this.selectedGroup = '';
        this.selectedSex = '';
        this.minAge = 1;
        this.maxAge = 100;
        this.uid = maxUID++;
    }
}

export default class Dashboard extends React.Component {
    static contextTypes = {
        router: React.PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        moment.locale('zh-cn');
        this.state = {
            showModal: false,
            beginDate: fixTime(moment('20170904', "YYYYMMDD").unix()),
            endDate: fixTime(moment().unix()),
            names: [],
            groups: [],
            searchOption: [new SearchOption()],
            activeKey: 'max',
            timeType: TIME_TYPE_DAY
        };
        $.getJSON("/names/").then((data) => this.setState({ names: data }));
        $.getJSON("/groups/").then((data) => this.setState({ groups: data }));

        this.option = {
            title: {
                text: '条件',
                x: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            legend: {
                data: ['全部'],
                x: 'left'
            },
            dataZoom: {
                show: true,
                start: 0,
            },
            toolbox: {
                show: true,
                orient: 'vertical',
                x: 'right',
                y: 'center',
                feature: {
                    mark: { show: true },
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line', 'bar', 'stack', 'tiled'] },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            calculable: true,
            yAxis: [
                {
                    type: 'value',
                    axisLabel: {
                        formatter: '{value} m/s'
                    }
                }
            ],
            series: [
                {
                    name: '平均值',
                    type: 'bar',
                    stack: '速度',
                    data: []
                },
                {
                    name: '最大值',
                    type: 'bar',
                    stack: '速度',
                    data: []
                },
                {
                    name: '最小值',
                    type: 'bar',
                    stack: '速度',
                    data: []
                },
            ]

        }
        this.initDate();
    }


    initDate() {
        var m = moment.unix(this.state.beginDate);
        var data = [m.format('MMMM Do')];
        for (var i = 0; i < MAX_DATA_COUNT; ++i) {
            data.push(m.add(1, 'days').format('MMMM Do'));
        }
        var xAxis = [
            {
                type: 'category',
                data: data
            }
        ];
        this.option.xAxis = xAxis;
    }

    stringfyOption(option) {
        var str = '';
        if (option.selectedName.length) {
            str += option.selectedName + '、';
        }
        if (option.selectedGroup) {
            str += option.selectedGroup + '、';
        }
        if (option.selectedSex) {
            str += option.selectedSex + '、';
        }
        if ((option.minAge == 1) && (option.maxAge == 100)) {

        } else {
            str += option.minAge + '~' + option.maxAge;

        }
        if (str) {
            if (str[str.length - 1] == '、') {
                str = str.substr(0, str.length - 1);
            }
            return str;
        }
        return '全部'
    }

    initData(data) {
        console.log(data);
        this.maxSeries = [];
        this.minSeries = [];
        this.aveSeries = [];
        var timeIndex = [];

        switch (this.state.timeType) {
            case TIME_TYPE_DAY:
                var m = moment.unix(this.state.beginDate);
                var timeData = [m.format('MMMM Do')];
                for (var i = 0; i < MAX_DATA_COUNT; ++i) {
                    timeData.push(m.add(1, 'days').format('MMMM Do'));
                }
                var xAxis = [
                    {
                        type: 'category',
                        data: timeData
                    }
                ];
                this.option.xAxis = xAxis;

                var beg = new Date(this.state.beginDate * 1000)
                for (var i = 0; i < MAX_DATA_COUNT; ++i, beg.setDate(beg.getDate() + 1)) {
                    timeIndex[beg.getTime() / 1000] = i;
                }
                break;
            case TIME_TYPE_MONTH:
                var m = moment.unix(this.state.beginDate);
                m = moment(new Date(m.year(), m.month(), 1, 0, 0, 0, 0));
                var timeData = [m.format('MMMM YYYY')];
                timeIndex[m.unix()] = 0;
                for (var i = 0; i < MAX_DATA_COUNT; ++i) {
                    timeData.push(m.add(1, 'months').format('MMMM YYYY'));
                    timeIndex[m.unix()] = i + 1;
                }
                var xAxis = [
                    {
                        type: 'category',
                        data: timeData
                    }
                ];
                this.option.xAxis = xAxis;

                break;
            case TIME_TYPE_YEAR:
                var m = moment.unix(this.state.beginDate);
                m = moment(new Date(m.year(), 0, 1, 0, 0, 0, 0));
                var timeData = [m.format('YYYY')];
                timeIndex[m.unix()] = 0;
                for (var i = 0; i < MAX_DATA_COUNT; ++i) {
                    timeData.push(m.add(1, 'years').format('YYYY'));
                    timeIndex[m.unix()] = i + 1;
                }
                var xAxis = [
                    {
                        type: 'category',
                        data: timeData
                    }
                ];
                this.option.xAxis = xAxis;


                break;
        }

        this.option.legend = {
            data: [],
            x: 'left'
        };

        this.option.title = {
            text: '',
            x: 'center'
        };

        var optionNameMap = new Map();
        for (var i = 0; i < data.length; ++i) {
            var optionName = this.stringfyOption(this.state.searchOption[i]);
            if (i == 0) {

            } else {
                this.option.title.text += ' ---- ';

            }
            this.option.title.text += optionName;
            if (optionNameMap.get(optionName)) {
                optionName += 1;
                optionNameMap.set(optionName, optionNameMap.get(optionName) + 1);
            } else {
                optionNameMap.set(optionName, 1);

            }
            this.aveSeries.push({
                name: optionName,
                type: 'bar',
                stack: 'average' + i,
                data: []
            });
            this.maxSeries.push({
                name: optionName,
                type: 'bar',
                stack: 'max' + i,
                data: []
            });
            this.minSeries.push({
                name: optionName,
                type: 'bar',
                stack: 'min' + i,
                data: []
            });
            for (var j = 0; j < MAX_DATA_COUNT; ++j) {
                this.aveSeries[i].data.push(0)
                this.maxSeries[i].data.push(0)
                this.minSeries[i].data.push(0)
            }

            data[i].forEach((element) => {
                this.aveSeries[i].data[timeIndex[element._id]] = element.value.aveSpeed;
                this.minSeries[i].data[timeIndex[element._id]] = element.value.minSpeed;
                this.maxSeries[i].data[timeIndex[element._id]] = element.value.maxSpeed;
            });

            this.option.legend.data.push(optionName);

        }

        this.switchData();
        // switch (this.state.activeKey) {
        //     case 'max':
        //         this.option.series = this.maxSeries;
        //         this.option.title.text = '最大速度';
        //         break;
        //     case 'min':
        //         this.option.series = this.minSeries;
        //         this.option.title.text = '最小速度';
        //         break;
        //     case 'average':
        //         this.option.series = this.aveSeries;
        //         this.option.title.text = '平均速度';
        //         break;
        // }

    }

    switchData() {
        switch (this.state.activeKey) {
            case 'max':
                this.option.series = this.maxSeries;
                this.option.yAxis[0].name = '最大速度';
                break;
            case 'min':
                this.option.series = this.minSeries;
                this.option.yAxis[0].name = '最小速度';
                break;
            case 'average':
                this.option.series = this.aveSeries;
                this.option.yAxis[0].name = '平均速度';
                break;
        }

    }
    componentWillMount() {
        $('#pageLoading').hide();
    }

    componentDidMount() {
        this.myChart = ec.init(document.getElementById('chart'));
        this.myChart.setOption(this.option);

        this.querySpeed()
    }

    open() {
        this.setState({ showModal: true });
    }

    close() {
        this.setState({ showModal: false });
    }

    handleBeginDateChange(value) {
        this.setState({ beginDate: fixTime(value.unix()) });
    }

    handleEndDateChange(value) {
        this.setState({ endDate: fixTime(value.unix()) });
    }

    handleNameSelect(searchOption, value) {
        searchOption.selectedName = value;
        this.forceUpdate();
    }

    handleGroupSelect(searchOption, value) {
        searchOption.selectedGroup = value;
        this.forceUpdate();
    }

    handleSexSelect(searchOption, value) {
        searchOption.selectedSex = value;
        this.forceUpdate();
    }
    setMinAge(searchOption, value) {
        searchOption.minAge = value;
        this.forceUpdate();
    }
    setMaxAge(searchOption, value) {
        searchOption.maxAge = value;
        this.forceUpdate();
    }

    handleAddOption() {
        this.state.searchOption.push(new SearchOption());
        this.forceUpdate();
    }

    handleDeleteOption(i) {
        this.state.searchOption.splice(i, 1);
        this.forceUpdate();
    }

    handleValueSelect(activeKey) {
        // this.setState({ activeKey: activeKey });
        this.state.activeKey = activeKey;
        this.forceUpdate();
        this.switchData();
        // switch (activeKey) {
        //     case 'max':
        //         this.option.series = this.maxSeries;
        //         break;
        //     case 'min':
        //         this.option.series = this.minSeries;
        //         break;
        //     case 'average':
        //         this.option.series = this.aveSeries;
        //         break;
        // }
        this.myChart.setOption(this.option, true);

    }

    handleTimeSelect(activeKey) {
        this.state.timeType = activeKey;
        this.forceUpdate();
        this.querySpeed();
    }

    queryNames() {
        $.getJSON("/names/").then((data) => this.state.names = data);
    }

    querySpeed() {
        this.myChart.showLoading();
        var searchOptions = [];
        this.state.searchOption.forEach(function (element) {
            searchOptions.push({ name: element.selectedName, group: element.selectedGroup, sex: element.selectedSex, minAge: element.minAge, maxAge: element.maxAge });
        });

        $.ajax({
            method: "GET",
            url: "/speed/",
            traditional: true,
            data: { searchOptions: JSON.stringify(searchOptions), begTime: this.state.beginDate, endTime: this.state.endDate, timeType: this.state.timeType }
        }).then((data) => {
            this.close();

            this.initDate();
            this.initData(data);
            this.myChart.setOption(this.option, true);
        }).always(() => {
            this.myChart.hideLoading();
        });
    }

    generateSearchOption(names, groups) {
        var searchOptions = [];
        var length = this.state.searchOption.length;
        for (var i = 0; i < length; ++i) {
            var element = this.state.searchOption[i];
            searchOptions.push(
                <Row key={2 * element.uid} className="show-grid" style={{ marginTop: '10px', marginBottom: '10px' }}>
                    {(i == 0) ? (<Col sm={12} md={1}>查询条件：</Col>) : (<Col sm={12} md={1}></Col>)}
                    <Col xs={10} sm={7} md={7}>
                        <Row className="show-grid">
                            <Col sm={12} md={6} style={{ marginTop: '10px', marginBottom: '10px' }}>
                                <span style={{ marginRight: '10px' }}>会员</span>
                                <Select mode="multiple" defaultValue={element.selectedName} allowClear={true} onChange={this.handleNameSelect.bind(this, element)} style={{ width: '150px' }}>
                                    {names}
                                </Select>
                            </Col>
                            <Col sm={12} md={6} style={{ marginTop: '10px', marginBottom: '10px' }}>
                                <span style={{ marginRight: '10px' }}>群组</span>
                                <Select defaultValue={element.selectedGroup} allowClear={true} onChange={this.handleGroupSelect.bind(this, element)} style={{ width: '150px' }}>
                                    {groups}
                                </Select>
                            </Col>
                        </Row>
                        <Row className="show-grid" >
                            <Col sm={12} md={6} style={{ marginTop: '10px', marginBottom: '10px' }}>
                                <span style={{ marginRight: '10px' }}>年龄</span>
                                <InputNumber defaultValue={element.minAge} min={1} max={100} onChange={this.setMinAge.bind(this, element)} />
                                <span style={{ marginLeft: '5px', marginRight: '5px' }}> ~ </span>
                                <InputNumber defaultValue={element.maxAge} min={1} max={100} onChange={this.setMaxAge.bind(this, element)} />
                            </Col>
                            <Col sm={12} md={6} style={{ marginTop: '10px', marginBottom: '10px' }}>
                                <span style={{ marginRight: '10px' }}>性别</span>
                                <Select defaultValue={element.selectedSex} allowClear={true} onChange={this.handleSexSelect.bind(this, element)} style={{ width: '100px' }}>
                                    <Option key="male">男</Option >
                                    <Option key="female">女</Option >
                                </Select>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={1} sm={1} md={1} style={{ marginTop: '20px' }}>
                        <Button onClick={this.handleDeleteOption.bind(this, i)} >-</Button>
                    </Col>
                </Row>
            );
            searchOptions.push(
                <Media query={{ maxWidth: 768 }} key={i * 2 + 1}>
                    {matches => matches ?
                        (<Media query={{ maxWidth: 500 }} >
                            {matches => matches ?
                                (<hr key={i * 2 + 1} style={{ width: '300px' }} />) :
                                (<hr key={i * 2 + 1} style={{ width: '550px' }} />)}
                        </Media>) :
                        (<hr key={i * 2 + 1} style={{ width: '850px' }} />)}
                </Media>)
        }
        return searchOptions;
    }

    render() {
        var margin = {};
        var rowMargin = { marginTop: '20px', marginBottom: '20px' };

        var names = [];
        this.state.names.forEach(function (element) {
            names.push(<Option key={element._id}>{element._id}</Option>);
        });

        var groups = [];
        this.state.groups.forEach(function (element) {
            groups.push(<Option key={element._id}>{element._id}</Option>);
        });

        return (
            <div >
                <Navbar collapseOnSelect>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <span>数据查询</span>
                        </Navbar.Brand>
                        <Navbar.Toggle />
                    </Navbar.Header>
                    <Navbar.Collapse>
                        <Nav>
                            <NavItem>
                                <Button bsStyle="primary" style={margin} onClick={this.open.bind(this)}>查询</Button>
                            </NavItem>
                        </Nav>
                        <Nav bsStyle="pills" activeKey={this.state.activeKey} onSelect={this.handleValueSelect.bind(this)} style={{ marginLeft: '5px', marginTop: '5px' }}>
                            <NavItem eventKey='max'>最大值</NavItem>
                            <NavItem eventKey='min'>最小值</NavItem>
                            <NavItem eventKey='average'>平均值</NavItem>
                        </Nav>

                        <Nav pullRight bsStyle="pills" activeKey={this.state.timeType} onSelect={this.handleTimeSelect.bind(this)} style={{ marginLeft: '5px', marginTop: '5px' }}>
                            <NavItem eventKey={TIME_TYPE_YEAR}>年</NavItem>
                            <NavItem eventKey={TIME_TYPE_MONTH}>月</NavItem>
                            <NavItem eventKey={TIME_TYPE_DAY}>日</NavItem>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <div id='chart' style={{ height: '600px', border: '1px solid #ccc', padding: '10px' }} />

                <Modal bsSize="large" show={this.state.showModal} onHide={this.close.bind(this)}>
                    <Modal.Header closeButton>
                        <Modal.Title>查询</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Grid>
                            <Row className="show-grid" style={{ marginBottom: '30px' }}>
                                <Col sm={1}>时间：</Col>
                                <Col sm={3}>
                                    <span style={{ marginRight: '10px' }}>起始时间</span>
                                    <DatePicker defaultValue={moment.unix(this.state.beginDate)} allowClear={false} onChange={this.handleBeginDateChange.bind(this)} style={{ marginTop: '10px', marginBottom: '10px' }} />
                                </Col>
                                <Col sm={3}>
                                    <span style={{ marginRight: '10px' }}>结束时间</span>
                                    <DatePicker defaultValue={moment.unix(this.state.endDate)} allowClear={false} onChange={this.handleEndDateChange.bind(this)} style={{ marginTop: '10px', marginBottom: '10px' }} />
                                </Col>
                            </Row>
                            {this.generateSearchOption(names, groups)}
                            <Row className="show-grid" style={{ marginTop: '30px', marginBottom: '10px' }}>
                                <Col smOffset={4} sm={1}>
                                    <Button onClick={this.handleAddOption.bind(this)} style={{ width: 50 }}>+</Button>
                                </Col>
                            </Row>
                            <Row className="show-grid" style={{ marginTop: '30px', marginBottom: '10px' }}>
                                <Col sm={3} md={3}><Button bsStyle="primary" onClick={this.querySpeed.bind(this)} style={{ marginTop: '10px', marginBottom: '10px' }}>查询速度</Button></Col>
                                <Col sm={3} md={3}><Button bsStyle="primary" style={{ marginTop: '10px', marginBottom: '10px' }}>查询轨迹</Button></Col>
                                <Col sm={3} md={3}><Button bsStyle="primary" style={{ marginTop: '10px', marginBottom: '10px' }}>查询热点</Button></Col>
                            </Row>
                        </Grid>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close.bind(this)}>关闭</Button>
                    </Modal.Footer>
                </Modal>
            </div>

        );
    }
}




