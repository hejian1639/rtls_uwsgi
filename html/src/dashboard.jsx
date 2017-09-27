
import React from 'react'
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Grid, Row, Col, Button, Modal, OverlayTrigger, Popover, Tooltip, ButtonGroup } from 'react-bootstrap';
import $ from 'jquery'
import ec from 'echarts'
import { DatePicker, Select, InputNumber } from 'antd';
const Option = Select.Option;
import moment from 'moment-with-locales';

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
            selectedName: [],
            selectedGroup: '',
            selectedSex: ''
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
            legend: {
                data: ['平均值', '最大值', '最小值']
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
        var series = [
            {
                name: '平均值',
                type: 'bar',
                stack: 'average',
                data: []
            },
            {
                name: '最大值',
                type: 'bar',
                stack: 'max',
                data: []
            },
            {
                name: '最小值',
                type: 'bar',
                stack: 'min',
                data: []
            },
        ]
        var beg = this.state.beginDate
        var timeIndex = []
        for (var i = 0; i < MAX_DATA_COUNT; ++i, beg += 24 * 60 * 60) {
            series[0].data.push(0)
            series[1].data.push(0)
            series[2].data.push(0)
            timeIndex[beg] = i;
        }

        data.forEach(function (element) {
            series[0].data[timeIndex[element._id]] = element.value.aveSpeed;
            series[1].data[timeIndex[element._id]] = element.value.minSpeed;
            series[2].data[timeIndex[element._id]] = element.value.maxSpeed;
        });

        this.option.series = series;
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

    handleNameSelect(value) {
        this.setState({ selectedName: value })
    }

    handleGroupSelect(value) {
        this.setState({ selectedGroup: value })
    }

    handleSexSelect(value) {
        this.setState({ selectedSex: value })
    }

    queryNames() {
        $.getJSON("/names/").then((data) => this.state.names = data);
    }

    querySpeed() {
        this.myChart.showLoading();
        $.ajax({
            method: "GET",
            url: "/speed/",
            traditional: true,
            data: { 'name': this.state.selectedName, group: this.state.selectedGroup, sex: this.state.selectedSex, begTime: this.state.beginDate, endTime: this.state.endDate }
        }).then((data) => {
            this.close();

            this.initDate();
            this.initData(data);
            this.myChart.setOption(this.option, true);
        }).always(() => {
            this.myChart.hideLoading();
        });
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
                    </Navbar.Header>
                    <Navbar.Collapse>
                        <Nav>
                            <NavItem>
                                <Button bsStyle="primary" style={margin} onClick={this.open.bind(this)}>查询</Button>
                            </NavItem>
                        </Nav>
                        <Nav pullRight>
                            <NavItem>
                                <ButtonGroup>
                                    <Button>年</Button>
                                    <Button>月</Button>
                                    <Button>日</Button>
                                </ButtonGroup>
                            </NavItem>

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
                                    <DatePicker defaultValue={moment.unix(this.state.beginDate)} allowClear={false} onChange={this.handleBeginDateChange.bind(this)} />
                                </Col>
                                <Col sm={3}>
                                    <span style={{ marginRight: '10px' }}>结束时间</span>
                                    <DatePicker defaultValue={moment.unix(this.state.endDate)} allowClear={false} onChange={this.handleEndDateChange.bind(this)} />
                                </Col>
                            </Row>
                            <Row className="show-grid" style={{ marginTop: '30px', marginBottom: '10px' }}>
                                <Col sm={1}>查询条件：</Col>
                                <Col sm={3}>
                                    <span style={{ marginRight: '10px' }}>会员</span>
                                    <Select mode="multiple" defaultValue={this.state.selectedName} allowClear={true} onChange={this.handleNameSelect.bind(this)} style={{ width: 200 }}>
                                        {names}
                                    </Select>
                                </Col>
                                <Col sm={3}>
                                    <span style={{ marginRight: '10px' }}>群组</span>
                                    <Select defaultValue={this.state.selectedGroup} allowClear={true} onChange={this.handleGroupSelect.bind(this)} style={{ width: 200 }}>
                                        {groups}
                                    </Select>
                                </Col>
                            </Row>
                            <Row className="show-grid" style={{ marginTop: '10px', marginBottom: '30px' }}>
                                <Col smOffset={1} sm={3}>
                                    <span style={{ marginRight: '10px' }}>年龄</span>
                                    <InputNumber defaultValue={1} min={1} max={100} />
                                    <span style={{ marginLeft: '5px', marginRight: '5px' }}> ~ </span>
                                    <InputNumber defaultValue={100} min={1} max={100} />
                                </Col>
                                <Col sm={2}>
                                    <span style={{ marginRight: '10px' }}>性别</span>
                                    <Select defaultValue={this.state.selectedSex} allowClear={true} onChange={this.handleSexSelect.bind(this)} style={{ width: 100 }}>
                                        <Option key="male">男</Option >
                                        <Option key="female">女</Option >
                                    </Select>
                                </Col>
                            </Row>
                            <Row className="show-grid" style={{ marginTop: '30px', marginBottom: '10px' }}>
                                <Col smOffset={4} sm={1}><Button style={{ width: 50 }}>+</Button></Col>
                            </Row>
                            <Row className="show-grid" style={{ marginTop: '30px', marginBottom: '10px' }}>
                                <Col sm={3}><Button bsStyle="primary" onClick={this.querySpeed.bind(this)}>查询速度</Button></Col>
                                <Col sm={3}><Button bsStyle="primary">查询轨迹</Button></Col>
                                <Col sm={3}><Button bsStyle="primary">查询热点</Button></Col>
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




