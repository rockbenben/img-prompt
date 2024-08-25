import json

# 读取 JSON 数据
with open('prompt.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# 定义优先属性值
priority_value = "看"

# 使用字典来记录每个 displayName 出现的次数和对象，忽略大小写和下划线
display_names = {}
for obj in data:
    if "displayName" in obj:
        name = obj["displayName"].replace('_', ' ').lower()
        if name in display_names:
            display_names[name].append(obj)
        else:
            display_names[name] = [obj]
    else:
        print("Warning: Missing 'displayName' key in object:", obj)

# 找到重复的 displayName
duplicates = {key: value for key, value in display_names.items() if len(value) > 1}

# 用于存储删除的对象
deleted_objects = []

# 处理重复项
for key, items in duplicates.items():
    lang_name_groups = {}
    
    for item in items:
        lang_name = item.get('langName', None)
        if lang_name:
            if lang_name not in lang_name_groups:
                lang_name_groups[lang_name] = [item]
            else:
                lang_name_groups[lang_name].append(item)

    for lang, objs in lang_name_groups.items():
        if len(objs) > 1:
            # 优先属性值处理
            priority_objs = [obj for obj in objs if obj.get("attribute") == priority_value]
            if priority_objs:
                # 如果存在优先属性值的重复项，则删除非优先属性值的项
                to_delete = [obj for obj in objs if obj not in priority_objs] + priority_objs[1:]
                deleted_objects.extend(to_delete)
                for obj in to_delete:
                    if obj in data:
                        data.remove(obj)
            else:
                # 如果都不在优先属性值中，则不删除重复项
                continue

# 输出删除结果到 delete.txt，如果有删除项
if deleted_objects:
    with open('delete.txt', 'w', encoding='utf-8') as outfile:
        json.dump(deleted_objects, outfile, ensure_ascii=False, indent=2)
else:
    print("No duplicates to delete.")

# 将更新后的数据写回源文件
with open('prompt.json', 'w', encoding='utf-8') as file:
    json.dump(data, file, ensure_ascii=False, indent=2)
