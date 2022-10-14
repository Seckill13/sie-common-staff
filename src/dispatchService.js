import localforage from "localforage";
import dayjs from 'dayjs'

import { SIE_PROJECTS_TABLE, COMMON_STAFFS_TABLE, SIE_DISPATCH_RESULT, SIE_HOLIDAY } from '../constant'

async function disp(somedayOfMonth) {

	let dispatchResults = await localforage.getItem(SIE_DISPATCH_RESULT);

	if (dispatchResults && dispatchResults.length > 0) {
		console.log("dispatchResults=", dispatchResults)
		return dispatchResults
	}

	console.log("dispatchResults=2", dispatchResults)
	let staffs = await localforage.getItem(COMMON_STAFFS_TABLE);

	let sieHoliday = await localforage.getItem(SIE_HOLIDAY);
	console.log(sieHoliday)
	let workDays = getWorkdays(somedayOfMonth, sieHoliday);
	let projects = await localforage.getItem(SIE_PROJECTS_TABLE);

	const totalDays = staffs.length * workDays.length;

	for (let index = 0; index < projects.length; index++) {
		const element = projects[index];
		element.index = index;
		element.right = 0;
		element.round = 0;
		element.actuallRound = 0;
		element.disQty = 0;

	};

	console.log("totalPerson=", projects);
	let totalPerson = projects.map(vo => { return vo.projectCount }).reduce((per, current) => {
		return per + current
	});

	console.log("totalPerson=", totalPerson);

	projects.forEach(vo => {
		let right = totalDays * vo.projectCount / totalPerson;
		vo.right = right.toFixed(2)
		vo.round = Math.round(right)
		console.log("right=", vo.right);
		console.log("round=", vo.round);
	});

	let totalRound = projects.map(vo => { return vo.round }).reduce((per, current) => {
		return per + current
	});

	projects.sort((vo1, vo2) => {
		return (vo2.round - vo2.right) - (vo1.round - vo1.right);
	})
		;


	// 四舍五入后,总数比实际需要的人天大,差异大的先减1
	let diff = totalRound - totalDays;
	console.log("diff=", diff);
	if (diff > 0) {
		for (let i = 0; i < diff; i++) {
			projects[i].actuallRound = projects[i].round - 1;
		}
	}

	if (diff < 0) {
		for (let i = 0; i < Math.abs(diff); i++) {
			let index = projects.length - 1 - i;
			projects[index].actuallRound = projects[index].round + 1;

		}
	}
	;



	projects.filter(vo => { return vo.actuallRound === 0 })
		.forEach(vo => { vo.actuallRound = vo.round })
		;
	localforage.setItem(SIE_DISPATCH_RESULT, projects);
	return projects;
}


function getWorkdays(somedayOfMonth, sieHoliday) {

	console.log('sieHoliday=', sieHoliday);

	let specialHolidy = [];
	let spcialWorkDay = [];
	sieHoliday.forEach((val, key) => {
		if (val) {
			spcialWorkDay.push(dayjs(key))

		} else {
			spcialWorkDay.push(dayjs(key))
		}
	})

	// 获取当前第一天
	let firstDay = dayjs(somedayOfMonth).date(1);
	let lastDay = dayjs(firstDay).endOf('month');
	let workDays = [];
	for (let currentDay = dayjs(firstDay); !currentDay.isAfter(lastDay, 'day'); currentDay = currentDay.add(1, 'day')) {
		if (specialHolidy.some(vo => vo.isSame(currentDay, 'day'))) {
			continue;
		}
		if (spcialWorkDay.some(vo => vo.isSame(currentDay, 'day'))) {
			workDays.push(currentDay);
			continue;
		}
		if (!(currentDay.day() === 0 || currentDay.day() === 6)) {
			workDays.push(currentDay);
			continue;
		}
	}
	return workDays;
}

export default disp;

