
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

function fixTime(time) {
    const OFFSET = 8 * 60 * 60;
    time += OFFSET;
    time -= time % (24 * 60 * 60);
    time -= OFFSET;
    return time;
}

class SearchOption {
    constructor() {
        this.selectedName = [];
        this.selectedGroup = '';
        this.selectedSex = '';
        this.minAge = 1;
        this.maxAge = 100;

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
            activeKey: 'max'
        };
        $.getJSON("/names/").then((data) => this.setState({ names: data }));
        $.getJSON("/groups/").then((data) => this.setState({ groups: data }));

        this.option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
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
                    type: 'value'
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

    initData(data) {
        console.log(data);
        this.maxSeries = [];
        this.minSeries = [];
        this.aveSeries = [];
        var beg = this.state.beginDate
        var timeIndex = []
        for (var i = 0; i < MAX_DATA_COUNT; ++i, beg += 24 * 60 * 60) {
            timeIndex[beg] = i;
        }
        this.option.legend = {
            data: []
        };

        for (var i = 0; i < data.length; ++i) {
            this.aveSeries.push({
                name: '条件' + i,
                type: 'bar',
                stack: 'average' + i,
                data: []
            });
            this.maxSeries.push({
                name: '条件' + i,
                type: 'bar',
                stack: 'max' + i,
                data: []
            });
            this.minSeries.push({
                name: '条件' + i,
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

            this.option.legend.data.push('条件' + i);

        }

        switch (this.state.activeKey) {
            case 'max':
                this.option.series = this.maxSeries;
                break;
            case 'min':
                this.option.series = this.minSeries;
                break;
            case 'average':
                this.option.series = this.aveSeries;
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
        this.setState({ activeKey: activeKey });
        switch (activeKey) {
            case 'max':
                this.option.series = this.maxSeries;
                break;
            case 'min':
                this.option.series = this.minSeries;
                break;
            case 'average':
                this.option.series = this.aveSeries;
                break;
        }
        this.myChart.setOption(this.option, true);

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
            data: { searchOptions: JSON.stringify(searchOptions), begTime: this.state.beginDate, endTime: this.state.endDate }
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
                <Row key={2 * i} className="show-grid" style={{ marginTop: '10px', marginBottom: '10px' }}>
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
                <Media query={{ maxWidth: 768 }} key={2 * i + 1}>
                    {matches => matches ?
                        (<hr key={i * 2 + 1} style={{ width: '550px' }} />) :
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

                        <Nav pullRight bsStyle="pills" activeKey='year' style={{ marginLeft: '5px', marginTop: '5px' }}>
                            <NavItem eventKey='year'>年</NavItem>
                            <NavItem eventKey='month'>月</NavItem>
                            <NavItem eventKey='day'>日</NavItem>
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
                                <Col md={3}><Button bsStyle="primary" onClick={this.querySpeed.bind(this)} style={{ marginTop: '10px', marginBottom: '10px' }}>查询速度</Button></Col>
                                <Col md={3}><Button bsStyle="primary" style={{ marginTop: '10px', marginBottom: '10px' }}>查询轨迹</Button></Col>
                                <Col md={3}><Button bsStyle="primary" style={{ marginTop: '10px', marginBottom: '10px' }}>查询热点</Button></Col>
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




