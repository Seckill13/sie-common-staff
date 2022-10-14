import { Button, Form, Input,  Table } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLoaderData } from "react-router-dom"
import disp from '../service/dispatchService'
import './common.css'
import { set as setDispatchDB } from '../sie_db';
import {SIE_DISPATCH_RESULT} from '../constant'

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

export async function loader(){

  let dispResult =  await disp();
  return {dispResult};
}

const App = () => {
  const {dispResult} = useLoaderData();
  console.log(dispResult);
  const [dataSource, setDataSource] = useState(dispResult);

  const defaultColumns = [
	{
		title: "序号",
		width: 70,
		render: (_, record, index) => `${index + 1}`
	  },
    {
      title: '责任人',
      dataIndex: 'projectManager',
      width: '20%',
      editable: false,
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      editable: false,
    },
    {
      title: '人数',
      dataIndex: 'projectCount',
      editable: false,
    },
    {
      title: '原始分摊人天',
      dataIndex: 'right',
      editable: false,
    },
    {
      title: '四舍五入人天',
      dataIndex: 'round',
      editable: false,
    },
    
    {
      title: '系统调整后人天',
      dataIndex: 'actuallRound',
      editable: true,
    },
  ];

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
	setDispatchDB(SIE_DISPATCH_RESULT,newData)
    setDataSource(newData);
  };

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
        onClick={()=>{}}
        type=""
        style={{
          marginBottom: 16,
        }}
      >
       重新计算
      </Button>
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns}
        rowKey ='id'
		pagination={false}
      />
    </div>
  );
};

export default App;
