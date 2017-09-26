
import React from 'react'
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Grid, Row, Col, Button, Modal, OverlayTrigger, Popover, Tooltip, ButtonGroup } from 'react-bootstrap';
import $ from 'jquery'
import ec from 'echarts'
import { DatePicker, Select, InputNumber } from 'antd_';
const Option = Select.Option;
import moment from 'moment-with-locales';


export default class Dashboard extends React.Component {
    static contextTypes = {
        router: React.PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        // moment.locale('zh-cn');
        this.state = { showModal: false, beginDate: moment(), endDate: moment() };

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
                    data: [320, 332, 301, 334, 390, 330, 320]
                },
                {
                    name: '最大值',
                    type: 'bar',
                    stack: '速度',
                    data: [120, 132, 101, 134, 90, 230, 210]
                },
                {
                    name: '最小值',
                    type: 'bar',
                    stack: '速度',
                    data: [220, 182, 191, 234, 290, 330, 310]
                },
            ]

        }
        this.initDate();
    }

    initDate() {
        var m = this.state.beginDate.clone();
        var data = [m.format('MMMM Do')];
        for (var i = 0; i < 10; ++i) {
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

    componentWillMount() {
        $('#pageLoading').hide();
    }

    componentDidMount() {
        this.myChart = ec.init(document.getElementById('chart'));
        
        this.myChart.setOption(this.option);
        // $('#pageLoading').hide();
    }

    open() {
        this.setState({ showModal: true });
    }

    close() {
        this.setState({ showModal: false });
    }


    handleBeginDateChange(value) {
        this.setState({ beginDate: value });
    }

    handleEndDateChange(value) {
        this.setState({ endDate: value });
    }

    querySpeed() {
        $.get("/speed/", { name: '小李', group: '舞蹈', sex: 'male' }).then(
            (data) => {
                console.log(data);
                this.close();

                this.initDate();
                this.myChart.setOption(this.option);

            }
        );
    }

    render() {
        var margin = {};
        var rowMargin = { marginTop: '20px', marginBottom: '20px' };

        const popover = (
            <Popover id="modal-popover" title="popover">
                very popover. such engagement
            </Popover>
        );
        const tooltip = (
            <Tooltip id="modal-tooltip">
                wow.
            </Tooltip>
        );
        const dummySentences = ['Lorem ipsum dolor sit amet, consectetuer adipiscing elit.', 'Donec hendrerit tempor tellus.', 'Donec pretium posuere tellus.', 'Proin quam nisl, tincidunt et, mattis eget, convallis nec, purus.', 'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.', 'Nulla posuere.', 'Donec vitae dolor.', 'Nullam tristique diam non turpis.', 'Cras placerat accumsan nulla.', 'Nullam rutrum.', 'Nam vestibulum accumsan nisl.'];

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
                                    <span style={{ marginRight: '10px' }}>起始时间</span><DatePicker defaultValue={this.state.beginDate} onChange={this.handleBeginDateChange.bind(this)} />
                                </Col>
                                <Col sm={3}>
                                    <span style={{ marginRight: '10px' }}>结束时间</span><DatePicker defaultValue={this.state.endDate} onChange={this.handleEndDateChange.bind(this)} />
                                </Col>
                            </Row>
                            <Row className="show-grid" style={{ marginTop: '30px', marginBottom: '10px' }}>
                                <Col sm={1}>查询条件：</Col>
                                <Col sm={3}>
                                    <span style={{ marginRight: '10px' }}>会员</span>
                                    <Select mode="multiple" style={{ width: 200 }}>
                                        <Option key="张三">张三</Option >
                                        <Option key="李四">李四</Option >
                                        <Option key="王五">王五</Option >
                                        <Option key="赵六">赵六</Option >
                                    </Select>
                                </Col>
                                <Col sm={3}>
                                    <span style={{ marginRight: '10px' }}>群组</span>
                                    <Select style={{ width: 200 }}>
                                        <Option key="太极">太极</Option >
                                        <Option key="舞蹈">舞蹈</Option >
                                    </Select>
                                </Col>
                            </Row>
                            <Row className="show-grid" style={{ marginTop: '10px', marginBottom: '30px' }}>
                                <Col smOffset={1} sm={3}>
                                    <span style={{ marginRight: '10px' }}>年龄</span>
                                    <InputNumber min={1} max={100} />
                                    <span style={{ marginLeft: '5px', marginRight: '5px' }}> ~ </span>
                                    <InputNumber min={1} max={100} />
                                </Col>
                                <Col sm={2}>
                                    <span style={{ marginRight: '10px' }}>性别</span>
                                    <Select style={{ width: 100 }}>
                                        <Option key="male">男</Option >
                                        <Option key="female">女</Option >
                                    </Select>
                                </Col>
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




