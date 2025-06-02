import { Button, Input, Menu, Grid, Card, Form, Checkbox, Alert, message, List, Avatar, Badge, ConfigProvider, Layout, Space, Row, Col, Comment, Divider, Select, Slider, InputNumber, Progress, Drawer, Modal, PageHeader, Statistic, Table, Radio, Tooltip, Tabs, Pagination, Empty, Tag, Upload } from 'ant-design-vue';

const components = [
  Button,
  Input,
  Menu,
  Grid,
  Card,
  Form,
  Checkbox,
  Alert,
  message,
  List,
  Avatar,
  Badge,
  ConfigProvider,
  Layout,
  Space,
  Row,
  Col,
  Comment,
  Divider,
  Select,
  Slider,
  InputNumber,
  Progress,
  Drawer,
  Modal,
  PageHeader,
  Statistic,
  Table,
  Radio,
  Tooltip,
  Tabs,
  Pagination,
  Empty,
  Tag,
  Upload, // 添加 Upload 组件
];

export function setupAntd(app) {
  components.forEach(component => {
    app.use(component);
  });
}
