let permission = [
	{
		"level": 0,
		"listPermission": [
				"/users",
				"/articles",
				"/comments",
				"/groupUsers",
				"/statisticals"
			]
	},
	{
		"level": 1,
		"listPermission": [
				"/articles",
				"/comments",
				"/statisticals"
			]
	},
	{
		"level": 2,
		"listPermission": [
				"/articles/list",
				"/articles/item",
				"/comments/list",
				"/comments/item",
				"/statisticals"
			]
	}
];

module.exports = permission;