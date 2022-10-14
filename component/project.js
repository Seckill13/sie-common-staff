import { Button, Form, Input, Popconfirm, Table } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import './common.css'
import { pg2_projects } from '../constant';
import {queryRecords, set as setProjectsDB } from '../sie_db';
import { useLoaderData } from "react-router-dom"
import {SIE_PROJECTS_TABLE} from '../constant'
const EditableContext = React.createContext(null);


const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};


export async function loader() {
  const projects = await queryRecords(SIE_PROJECTS_TABLE);
  return { projects };
}

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const App = () => {
  const {projects} = useLoaderData();
  const [dataSource, setDataSource] = useState(projects);
  const [count, setCount] = useState(projects.length);

  const handleDelete = (id) => {
    const newData = dataSource.filter((item) => item.id !== id);
	setProjectsDB(SIE_PROJECTS_TABLE,newData);
    setDataSource(newData);
  };

  const defaultColumns = [
    {
      title:"序号",
      width:70,
      render:(_,record,index)=>`${index+1}`
      
    },
    {
      title: '责任人',
      dataIndex: 'projectManager',
      width: '20%',
      editable: true,
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      editable: true,
    },
	{
		title: '优先级',
		dataIndex: 'priority',
		editable: true		
	  },
    {
      title: '人数',
      dataIndex: 'projectCount',
      editable: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.id)}>
            <a>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ];

  const handleAdd = () => {
    const newData = {
      key: count,
      projectManager: '',
      projectName: '',
      projectCount: 10,
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
	setProjectsDB(SIE_PROJECTS_TABLE,newData)
    setDataSource(newData);
  };

  
  async function handleDefaultProjects() {

    await setProjectsDB(SIE_PROJECTS_TABLE,pg2_projects)
    setDataSource(pg2_projects);
  }
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });
  return (
    <div>
      <Button
        onClick={handleAdd}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        Add a row
      </Button>
      <Button
        onClick={handleDefaultProjects}
        type=""
        style={{
          marginBottom: 16,
        }}
      >
       设置默认值
      </Button>
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
		pagination={false}
      />
    </div>
  );
};

export default App;
