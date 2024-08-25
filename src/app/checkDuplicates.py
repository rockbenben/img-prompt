import json

# 从文件中读取 JSON 数据
with open('prompt.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# 使用字典来记录每个 displayName 出现的次数和对象，忽略大小写和下划线，并处理最后一个字符为's'的情况
display_names = {}
for obj in data:
    # 检查对象是否包含 'displayName' 键
    if "displayName" in obj:
        # 将 displayName 的下划线替换为空格，然后转换为小写以忽略大小写
        name = obj["displayName"].replace('-', ' ').replace('_', ' ').replace('(', ' ').replace(')', ' ').lower()
        if name.endswith('s'):
            name = name[:-1]  # 删除最后一个字符's'
        if name in display_names:
            display_names[name].append(obj)
        else:
            display_names[name] = [obj]
    else:
        # 可选：处理缺失 'displayName' 的情况，例如打印警告
        print("Warning: Missing 'displayName' key in object:", obj)

# 提取 displayName 值相同（忽略大小写和下划线，并处理's'）的对象
duplicates = {key: value for key, value in display_names.items() if len(value) > 1}

print(json.dumps(duplicates, ensure_ascii=False, indent=2))

# 将结果写入到 check.txt 文件中
if duplicates:
    with open('check.txt', 'w', encoding='utf-8') as outfile:
        json.dump(duplicates, outfile, ensure_ascii=False, indent=2)
