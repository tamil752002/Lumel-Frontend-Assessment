import React, { useState, useEffect } from "react";



const App = () => {
  const [items, setItems] = useState([]);
  const [inputs, setInputs] = useState({});
  const apiData = [
    {
      id: "electronics",
      label: "Electronics",
      value: 1400,
      children: [
        { id: "phones", label: "Phones", value: 800 },
        { id: "laptops", label: "Laptops", value: 700 },
      ],
    },
    {
      id: "furniture",
      label: "Furniture",
      value: 1000,
      children: [
        { id: "tables", label: "Tables", value: 300 },
        { id: "chairs", label: "Chairs", value: 700 },
      ],
    },
  ];
  
  function ConvertData(data) {
    return data.map(item => {
      if (item.children) {
        const children = item.children.map(child => ({
          ...child,
          originalValue: child.value,
          variance: 0,
        }));
        const total = children.reduce((sum, child) => sum + child.value, 0);
        return { ...item, children, value: total, originalValue: total, variance: 0 };
      }
      return { ...item, originalValue: item.value, variance: 0 };
    });
  }

  useEffect(() => {
    setItems(ConvertData(apiData));
  }, []);

  const updateItemPercentage = (items, id, percentage) => {
    return items.map(item => {
      if (item.id === id) {
        const factor = 1 + percentage / 100;
        if (item.children) {
          const newChildren = item.children.map(child => ({
            ...child,
            value: child.value * factor,
            variance: ((child.value * factor - child.originalValue) / child.originalValue) * 100,
          }));
          const newValue = newChildren.reduce((sum, child) => sum + child.value, 0);
          return { ...item, value: newValue, variance: ((newValue - item.originalValue) / item.originalValue) * 100, children: newChildren };
        } else {
          const newValue = item.value * factor;
          return { ...item, value: newValue, variance: ((newValue - item.originalValue) / item.originalValue) * 100 };
        }
      } else if (item.children) {
        const newChildren = updateItemPercentage(item.children, id, percentage);
        const newValue = newChildren.reduce((sum, child) => sum + child.value, 0);
        return { ...item, children: newChildren, value: newValue, variance: ((newValue - item.originalValue) / item.originalValue) * 100 };
      }
      return item;
    });
  };

  const updateItemValue = (items, id, newValue) => {
    return items.map(item => {
      if (item.id === id) {
        if (item.children) {
          const factor = newValue / item.value;
          const newChildren = item.children.map(child => {
            const newChildValue = child.value * factor;
            return { ...child, value: newChildValue, variance: ((newChildValue - child.originalValue) / child.originalValue) * 100 };
          });
          const sumChildren = newChildren.reduce((sum, child) => sum + child.value, 0);
          return { ...item, value: sumChildren, variance: ((sumChildren - item.originalValue) / item.originalValue) * 100, children: newChildren };
        } else {
          return { ...item, value: newValue, variance: ((newValue - item.originalValue) / item.originalValue) * 100 };
        }
      } else if (item.children) {
        const newChildren = updateItemValue(item.children, id, newValue);
        const sumChildren = newChildren.reduce((sum, child) => sum + child.value, 0);
        return { ...item, children: newChildren, value: sumChildren, variance: ((sumChildren - item.originalValue) / item.originalValue) * 100 };
      }
      return item;
    });
  };

  return (
    <div style={{display:"flex",justifyContent:"center",marginTop:"20px"}}>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>Label</th>
            <th>Value</th>
            <th>Input</th>
            <th>Allocation %</th>
            <th>Allocation Val</th>
            <th>Variance %</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            const renderRows = (items, level = 0) =>
              items.map(item => (
                <React.Fragment key={item.id}>
                  <tr>
                    <td style={{ paddingLeft: `${level * 20}px` }}>
                      {level > 0 ? "-- " : ""}
                      {item.label}
                    </td>
                    <td>{item.value.toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        value={inputs[item.id] || ""}
                        onChange={(e) => setInputs({ ...inputs, [item.id]: e.target.value })}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          const inputVal = parseFloat(inputs[item.id]) || 0;
                          setItems(prev => updateItemPercentage(prev, item.id, inputVal));
                        }}
                      >
                         % Button
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          const inputVal = parseFloat(inputs[item.id]) || 0;
                          setItems(prev => updateItemValue(prev, item.id, inputVal));
                        }}
                      >
                         Value Button
                      </button>
                    </td>
                    <td>{item.variance.toFixed(2)}%</td>
                  </tr>
                  {item.children && renderRows(item.children, level + 1)}
                </React.Fragment>
              ));
            return renderRows(items);
          })()}
        </tbody>
      </table>
    </div>
  );
};

export default App;
