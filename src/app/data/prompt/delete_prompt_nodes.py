import json
import os
from pathlib import Path

def delete_nodes_by_display_name(json_file_path, display_names_to_delete):
    """
    删除JSON文件中指定displayName值的节点
    
    Args:
        json_file_path: JSON文件路径
        display_names_to_delete: 要删除的displayName值列表
    """
    try:
        # 读取JSON文件
        with open(json_file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        # 记录删除的节点数量
        deleted_count = 0
        
        # 如果数据是列表，遍历并删除匹配的节点
        if isinstance(data, list):
            original_length = len(data)
            data = [item for item in data if item.get('displayName') not in display_names_to_delete]
            deleted_count = original_length - len(data)
        
        # 如果数据是字典，递归处理
        elif isinstance(data, dict):
            deleted_count = remove_nodes_recursive(data, display_names_to_delete)
        
        # 写回文件
        if deleted_count > 0:
            with open(json_file_path, 'w', encoding='utf-8') as file:
                json.dump(data, file, ensure_ascii=False, indent=2)
            print(f"✓ {json_file_path}: 删除了 {deleted_count} 个节点")
        else:
            print(f"- {json_file_path}: 未找到匹配的节点")
            
    except Exception as e:
        print(f"✗ 处理文件 {json_file_path} 时出错: {e}")

def remove_nodes_recursive(data, display_names_to_delete):
    """
    递归删除字典或列表中的节点
    """
    deleted_count = 0
    
    if isinstance(data, dict):
        # 处理字典的值
        for key, value in list(data.items()):
            if isinstance(value, (dict, list)):
                deleted_count += remove_nodes_recursive(value, display_names_to_delete)
            elif key == 'displayName' and value in display_names_to_delete:
                # 如果找到要删除的displayName，标记整个父对象删除
                return 1
        
        # 删除子字典中标记删除的项
        keys_to_delete = []
        for key, value in data.items():
            if isinstance(value, list):
                original_length = len(value)
                data[key] = [item for item in value if not (isinstance(item, dict) and item.get('displayName') in display_names_to_delete)]
                deleted_count += original_length - len(data[key])
    
    elif isinstance(data, list):
        original_length = len(data)
        data[:] = [item for item in data if not (isinstance(item, dict) and item.get('displayName') in display_names_to_delete)]
        deleted_count += original_length - len(data)
        
        # 递归处理列表中的其他项
        for item in data:
            if isinstance(item, (dict, list)):
                deleted_count += remove_nodes_recursive(item, display_names_to_delete)
    
    return deleted_count

def main():
    # 固定目录路径
    target_directory = Path(r"D:\Backup\Libraries\Documents\GitHub\Projects\img-prompt\1. web-imgprompt\src\app\data\prompt")
    
    # 要删除的displayName值
    display_names_to_delete = ["volumetric Light", "Volumetric"]
    
    print(f"开始处理目录: {target_directory}")
    print(f"要删除的displayName值: {display_names_to_delete}")
    print("-" * 50)
    
    # 检查目录是否存在
    if not target_directory.exists():
        print(f"错误: 目录不存在 - {target_directory}")
        return
    
    # 查找所有JSON文件
    json_files = list(target_directory.glob("*.json"))
    
    if not json_files:
        print("未找到任何JSON文件")
        return
    
    print(f"找到 {len(json_files)} 个JSON文件")
    print("-" * 50)
    
    # 处理每个JSON文件
    total_deleted = 0
    for json_file in json_files:
        delete_nodes_by_display_name(json_file, display_names_to_delete)
    
    print("-" * 50)
    print("处理完成!")

if __name__ == "__main__":
    main()