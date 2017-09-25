
import React from 'react'
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Grid, Row, Col, Button, Modal, OverlayTrigger, Popover, Tooltip, ButtonGroup } from 'react-bootstrap';
import $ from 'jquery'
import ec from 'echarts'
import { DatePicker, Select, InputNumber } from 'antd_';
const Option = Select.Option;
import moment from 'moment';


class QueryDialog extends React.Component {

}



export default class Dashboard extends React.Component {
    static contextTypes = {
        router: React.PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = { showModal: false, beginDate: moment(), endDate: moment() };
    }



    componentWillMount() {
        $('#pageLoading').hide();
    }

    componentDidMount() {
        var myChart = ec.init(document.getElementById('chart'));

        myChart.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            legend: {
                data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎', '百度', '谷歌', '必应', '其他']
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
            xAxis: [
                {
                    type: 'category',
                    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    name: '直接访问',
                    type: 'bar',
                    data: [320, 332, 301, 334, 390, 330, 320]
                },
                {
                    name: '邮件营销',
                    type: 'bar',
                    stack: '广告',
                    data: [120, 132, 101, 134, 90, 230, 210]
                },
                {
                    name: '联盟广告',
                    type: 'bar',
                    stack: '广告',
                    data: [220, 182, 191, 234, 290, 330, 310]
                },
                {
                    name: '视频广告',
                    type: 'bar',
                    stack: '广告',
                    data: [150, 232, 201, 154, 190, 330, 410]
                },
                {
                    name: '搜索引擎',
                    type: 'bar',
                    data: [862, 1018, 964, 1026, 1679, 1600, 1570],
                    markLine: {
                        itemStyle: {
                            normal: {
                                lineStyle: {
                                    type: 'dashed'
                                }
                            }
                        },
                        data: [
                            [{ type: 'min' }, { type: 'max' }]
                        ]
                    }
                },
                {
                    name: '百度',
                    type: 'bar',
                    barWidth: 5,
                    stack: '搜索引擎',
                    data: [620, 732, 701, 734, 1090, 1130, 1120]
                },
                {
                    name: '谷歌',
                    type: 'bar',
                    stack: '搜索引擎',
                    data: [120, 132, 101, 134, 290, 230, 220]
                },
                {
                    name: '必应',
                    type: 'bar',
                    stack: '搜索引擎',
                    data: [60, 72, 71, 74, 190, 130, 110]
                },
                {
                    name: '其他',
                    type: 'bar',
                    stack: '搜索引擎',
                    data: [62, 82, 91, 84, 109, 110, 120]
                }
            ]
        });
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
                                        <Option key="男">男</Option >
                                        <Option key="女">女</Option >
                                    </Select>
                                </Col>
                            </Row>
                            <Row className="show-grid" style={{ marginTop: '30px', marginBottom: '10px' }}>
                                <Col sm={3}><Button bsStyle="primary">查询速度</Button></Col>
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




